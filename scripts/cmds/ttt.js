const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 1000 }
}));

const TTTStats = mongoose.models.TTTStats || mongoose.model("TTTStats", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  rating: { type: Number, default: 0.0 }
}));

const TTTHistory = mongoose.models.TTTHistory || mongoose.model("TTTHistory", new mongoose.Schema({
  threadID: String,
  playerX: String,
  playerO: String,
  winner: { type: String, default: "draw" },
  bet: Number,
  time: { type: Date, default: Date.now }
}));

let games = {};

function checkWin(board, player) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(let combo of wins) {
    if(combo.every(i => board[i] === player)) return combo;
  }
  return false;
}

function updateRating(rating1, rating2, result) {
  const K = 0.4;
  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 4));
  let newRating = rating1 + K * (result - expected1);
  newRating = Math.max(0.0, Math.min(10.0, newRating));
  return parseFloat(newRating.toFixed(1));
}

function formatMoney(num) {
  if (num >= 1000000000000) return (num / 1000000000000).toFixed(1).replace(/\.0$/, "") + "T";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}

function getLevel(xp) {
  xp = xp || 0;
  return Math.floor(xp / 100) + 1;
}

function parseBet(str, balance) {
  if (!str) return null;
  str = str.toLowerCase().trim();
  if (str === "all") return 20000000;
  const match = str.match(/^(\d+(\.\d+)?)\s*()?$/);
  if (!match) return null;
  let value = parseFloat(match[1]);
  const unit = match[3];
  if (unit === "k") value *= 1000;
  else if (unit === "m") value *= 1000000;
  else if (unit === "b") value *= 1000000;
  else if (unit === "t") value *= 1000000000000;
  return Math.floor(value);
}

async function getAvatar(userID) {
  const url = `https://graph.facebook.com/${String(userID)}/picture?width=512&height=512`;
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return await loadImage(res.data);
}

async function drawProfile(stats, name, rank, avatar) {
  const canvas = createCanvas(1000, 650);
  const ctx = canvas.getContext("2d");
  let gradient = ctx.createLinearGradient(0, 0, 1000, 650);
  gradient.addColorStop(0, "#0f0f1a");
  gradient.addColorStop(1, "#1e1e3f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 650);
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 40px Arial";
  ctx.fillText("🎮 𝗧𝗧 𝗣𝗥𝗢 𝗣𝗥𝗢𝗙𝗜𝗟𝗘", 30, 60);
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 180, 80, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 70, 100, 160, 160);
  ctx.restore();
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(150, 180, 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.fillText(name, 260, 170);
  let wins = stats.wins || 0;
  let losses = stats.losses || 0;
  let draws = stats.draws || 0;
  let xp = stats.xp || 0;
  let rating = stats.rating || 0.0;
  let total = wins + losses + draws;
  let wr = total > 0? ((wins/total)*100).toFixed(1) : 0;
  let lv = getLevel(xp);
  let nextXp = lv * 100;
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`🏆 Rank: #${rank}`, 260, 210);
  ctx.fillText(`📊 Level: ${lv} | XP: ${xp}/${nextXp}`, 260, 245);
  let y = 300;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(`🎯 Matches: ${total}`, 40, y);
  ctx.fillText(`✅ Wins: ${wins} | ❌ Losses: ${losses} | 🤝 Draws: ${draws}`, 40, y+45);
  ctx.fillText(`🔥 Streak: ${stats.streak || 0} | 🏆 Best: ${stats.bestStreak || 0}`, 40, y+90);
  ctx.fillText(`⭐ Rating: ${rating}/10 | Winrate: ${wr}%`, 40, y+135);
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 20px Arial";
  ctx.fillText("⇝━━━━━━━━━━⇜", 30, 580);
  ctx.fillText("Use #ttt to play and earn XP", 30, 610);
  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);
  const cachePath = path.join(cacheDir, `tttprofile_${Date.now()}.png`);
  await fs.writeFile(cachePath, canvas.toBuffer("image/png"));
  return cachePath;
}

async function drawBoardImage(board, p1Name, p2Name, bet, winCombo = null, result = null) {
  const canvas = createCanvas(900, 580);
  const ctx = canvas.getContext("2d");
  let gradient = ctx.createLinearGradient(0, 0, 900, 580);
  gradient.addColorStop(0, "#0a0a0f");
  gradient.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 580);
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 36px Arial";
  ctx.fillText("🎮 𝗧𝗜𝗖 𝗧𝗔𝗖 𝗧𝗢𝗘 𝗣𝗥𝗢", 30, 55);
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`💰 Bet: $${formatMoney(bet)}`, 30, 90);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(`❌: ${p1Name}`, 30, 130);
  ctx.fillText(`⭕: ${p2Name}`, 30, 160);
  const startX = 300, startY = 210, size = 120;
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 8;
  for(let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(startX + i * size, startY);
    ctx.lineTo(startX + i * size, startY + 3 * size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, startY + i * size);
    ctx.lineTo(startX + 3 * size, startY + i * size);
    ctx.stroke();
  }
  for(let i = 0; i < 9; i++) {
    let x = startX + (i % 3) * size + size/2;
    let y = startY + Math.floor(i / 3) * size + size/2;
    ctx.font = "bold 75px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if(board[i] == "X") {
      ctx.fillStyle = "#ff3366";
      ctx.fillText("❌", x, y);
    } else if(board[i] == "O") {
      ctx.fillStyle = "#3399ff";
      ctx.fillText("⭕", x, y);
    }
  }
  if(winCombo) {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    const [a,b,c] = winCombo;
    const ax = startX + (a % 3) * size + size/2, ay = startY + Math.floor(a / 3) * size + size/2;
    const cx = startX + (c % 3) * size + size/2, cy = startY + Math.floor(c / 3) * size + size/2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  if(result == 'draw') {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, 900, 580);
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 100px Arial";
    ctx.textAlign = "center";
    ctx.fillText("DRAW", 450, 320);
  }
  ctx.textAlign = "left";
  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);
  const cachePath = path.join(cacheDir, `ttt_${Date.now()}.png`);
  await fs.writeFile(cachePath, canvas.toBuffer("image/png"));
  return cachePath;
}

async function setGameTimer(tid, game, usersData, api) {
  if(game.timer) clearTimeout(game.timer);
  game.timer = setTimeout(async () => {
    if(!games[tid]) return;
    let g = games[tid];
    let winnerID = g.turn == g.playerX? g.playerO : g.playerX;
    let loserID = g.turn;
    let winner = await BankUser.findOne({ userID: winnerID });
    let loser = await BankUser.findOne({ userID: loserID });
    winner.balance += g.bet * 2;
    loser.balance -= g.bet;
    let wStats = await TTTStats.findOne({ userID: winnerID }) || await TTTStats.create({ userID: winnerID });
    let lStats = await TTTStats.findOne({ userID: loserID }) || await TTTStats.create({ userID: loserID });
    let oldWR = wStats.rating || 0.0; let oldLR = lStats.rating || 0.0;
    wStats.rating = updateRating(oldWR, oldLR, 1);
    lStats.rating = updateRating(oldLR, oldWR, 0);
    wStats.wins = (wStats.wins || 0) + 1; wStats.streak = (wStats.streak || 0) + 1; wStats.xp = (wStats.xp || 0) + 50;
    lStats.losses = (lStats.losses || 0) + 1; lStats.streak = 0; lStats.xp = (lStats.xp || 0) + 10;
    if(wStats.streak > (wStats.bestStreak || 0)) wStats.bestStreak = wStats.streak;
    await winner.save(); await loser.save(); await wStats.save(); await lStats.save();
    await TTTHistory.create({threadID: tid, playerX: g.playerX, playerO: g.playerO, winner: winnerID, bet: g.bet});
    let loserName = await usersData.getName(String(loserID));
    delete games[tid];
    api.sendMessage(`⏰ 𝗧𝗜𝗠𝗘 𝗨𝗣!\n${loserName} 5min e move dei nai\n🎉 𝗪𝗜𝗡𝗘𝗥 𝗕𝗬 𝗗𝗘𝗙𝗔𝗨𝗟𝗧: ${await usersData.getName(String(winnerID))}\n💰 𝗪𝗢𝗡: $${formatMoney(g.bet*2)}`, tid);
  }, 5 * 60 * 1000);
}

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tic", "tttpro"],
    version: "5.4.0",
    author: "Sazzad",
    countDown: 3,
    role: 0,
    shortDescription: "Tic Tac Toe Pro",
    category: "game",
    guide: { en: "{p}ttt @tag 500b/all\n{p}ttt 1-9\n{p}ttt top\n{p}ttt p/@tag\n{p}ttt h - history" }
  },
  onStart: async function({ api, event, args, message, usersData }) {
    const tid = event.threadID;
    const MIN_BET = 1;
    const MAX_BET = 20000000;
    await TTTStats.updateMany({rating: {$gt: 10}}, { $set: { rating: 0.0 } });
    const getNameSafe = async (uid) => {
      if (!uid) return "Unknown";
      return await usersData.getName(String(uid));
    }
    if(args[0] == "h" || args[0] == "history") {
      let history = await TTTHistory.find({threadID: tid}).sort({time: -1}).limit(10);
      if(history.length == 0) return message.reply("📜 Ekhono kono match hoi nai");
      let msg = `📜 𝗟𝗔𝗦𝗧 10 𝗠𝗔𝗧𝗖𝗛𝗘𝗦\n⇝━━━━━━━━━━⇜\n`;
      for(let i = 0; i < history.length; i++) {
        let p1 = await getNameSafe(history[i].playerX);
        let p2 = await getNameSafe(history[i].playerO);
        let result = history[i].winner == "draw"? "🤝 Draw" : `👑 Win: ${await getNameSafe(history[i].winner)}`;
        msg += `\n${i+1}. ${p1} vs ${p2}\n💰 $${formatMoney(history[i].bet)} | ${result}`;
      }
      return message.reply(msg);
    }
    if(args[0] == "p" || args[0] == "profile") {
      let uid = event.senderID;
      if(event.mentions && Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
      let stats = await TTTStats.findOne({ userID: uid }) || await TTTStats.create({ userID: uid });
      let name = await getNameSafe(uid);
      let avatar = await getAvatar(uid);
      let all = await TTTStats.find().sort({rating: -1});
      let rank = all.findIndex(u => u.userID == uid) + 1;
      let img = await drawProfile(stats, name, rank, avatar);
      return message.reply({attachment: fs.createReadStream(img)});
    }
    if(args[0] == "top") {
      let top = await TTTStats.find().sort({rating: -1}).limit(10);
      let msg = `🏆 𝗧𝗧 𝗣𝗥𝗢 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗 🏆\n⇝━━━━━━━━━━━⇜\n`;
      for(let i = 0; i < top.length; i++) {
        let name = await getNameSafe(top[i].userID);
        let wins = top[i].wins || 0;
        let losses = top[i].losses || 0;
        let draws = top[i].draws || 0;
        let xp = top[i].xp || 0;
        let total = wins + losses + draws;
        let wr = total > 0? ((wins/total)*100).toFixed(1) : 0;
        let lv = getLevel(xp);
        let rating = (top[i].rating || 0.0).toFixed(1);
        msg += `\n🏅 #${i+1} ${name} [Lv.${lv}] | ⭐ ${rating}/10`;
        msg += `\n🎯 Matches: ${total} | ✅ Wins: ${wins} | ❌ Losses: ${losses} | 🤝 Draws: ${draws}`;
        msg += `\n📊 WR: ${wr}% | 🔥 Streak: ${top[i].streak || 0} | 🏆 Best: ${top[i].bestStreak || 0}\n`;
      }
      return message.reply(msg);
    }
    let g = games[tid];
    let isMove = args[0] &&!isNaN(args[0]) && g;
    if (isMove) {
      let pos = parseInt(args[0]) - 1;
      if (pos < 0 || pos > 8) return message.reply("❌ 1-9 er moddhe dao");
      if (g.board[pos] == "X" || g.board[pos] == "O") return message.reply("❌ Already taken");
      if (event.senderID!= g.turn) return message.reply("❌ Tomar turn na");
      let mark = g.playerX == event.senderID? "X" : "O";
      g.board[pos] = mark;
      setGameTimer(tid, g, usersData, api);
      let p1Name = await getNameSafe(g.playerX);
      let p2Name = await getNameSafe(g.playerO);
      let winCombo = checkWin(g.board, mark);
      let img = await drawBoardImage(g.board, p1Name, p2Name, g.bet, winCombo);
      if (winCombo) {
        clearTimeout(g.timer);
        let winnerID = event.senderID;
        let loserID = winnerID == g.playerX? g.playerO : g.playerX;
        let winner = await BankUser.findOne({ userID: winnerID });
        let loser = await BankUser.findOne({ userID: loserID });
        winner.balance += g.bet;
        loser.balance -= g.bet;
        let wStats = await TTTStats.findOne({ userID: winnerID }) || await TTTStats.create({ userID: winnerID });
        let lStats = await TTTStats.findOne({ userID: loserID }) || await TTTStats.create({ userID: loserID });
        let oldWR = wStats.rating || 0.0;
        let oldLR = lStats.rating || 0.0;
        wStats.rating = updateRating(oldWR, oldLR, 1);
        lStats.rating = updateRating(oldLR, oldWR, 0);
        wStats.wins = (wStats.wins || 0) + 1;
        wStats.streak = (wStats.streak || 0) + 1;
        wStats.xp = (wStats.xp || 0) + 50;
        if(wStats.streak > (wStats.bestStreak || 0)) wStats.bestStreak = wStats.streak;
        lStats.losses = (lStats.losses || 0) + 1;
        lStats.streak = 0;
        lStats.xp = (lStats.xp || 0) + 10;
        await winner.save();
        await loser.save();
        await wStats.save();
        await lStats.save();
        await TTTHistory.create({threadID: tid, playerX: g.playerX, playerO: g.playerO, winner: winnerID, bet: g.bet});
        let total = wStats.wins + wStats.losses + (wStats.draws || 0);
        let wr = total > 0? ((wStats.wins/total)*100).toFixed(1) : 0;
        delete games[tid];
        let finalImg = await drawBoardImage(g.board, p1Name, p2Name, g.bet, winCombo, 'win');
        return message.reply({ body: `🎉 𝗪𝗜𝗡𝗘𝗥: ${await getNameSafe(winnerID)}\n💰 𝗪𝗢𝗡: $${formatMoney(g.bet*2)}\n⭐ Rating: ${wStats.rating}/10 | Winrate: ${wr}% | +50 XP\n━━━━━━━━━━━\n❌ ${p1Name}\n⭕ ${p2Name}\n💵 Bet: $${formatMoney(g.bet)}`, attachment: fs.createReadStream(finalImg) });
      }
      if (!g.board.find(i =>!isNaN(i))) {
        clearTimeout(g.timer);
        let p1Stats = await TTTStats.findOne({ userID: g.playerX }) || await TTTStats.create({ userID: g.playerX });
        let p2Stats = await TTTStats.findOne({ userID: g.playerO }) || await TTTStats.create({ userID: g.playerO });
        let oldP1R = p1Stats.rating || 0.0;
        let oldP2R = p2Stats.rating || 0.0;
        p1Stats.rating = updateRating(oldP1R, oldP2R, 0.5);
        p2Stats.rating = updateRating(oldP2R, oldP1R, 0.5);
        p1Stats.draws = (p1Stats.draws || 0) + 1;
        p1Stats.streak = 0;
        p1Stats.xp = (p1Stats.xp || 0) + 20;
        p2Stats.draws = (p2Stats.draws || 0) + 1;
        p2Stats.streak = 0;
        p2Stats.xp = (p2Stats.xp || 0) + 20;
        await p1Stats.save();
        await p2Stats.save();
        await TTTHistory.create({threadID: tid, playerX: g.playerX, playerO: g.playerO, winner: "draw", bet: g.bet});
        delete games[tid];
        let finalImg = await drawBoardImage(g.board, p1Name, p2Name, g.bet, null, 'draw');
        return message.reply({ body: `🤝 𝗗𝗥𝗔𝗪!\n💰 𝗕𝗲𝘁 𝗥𝗲𝗳𝘂𝗻𝗱𝗲𝗱 | ⭐ Rating: ${p1Stats.rating}/10 / ${p2Stats.rating}/10 | +20 XP\n━━━━━━━━━━━\n❌ ${p1Name}\n⭕ ${p2Name}\n💵 Bet: $${formatMoney(g.bet)}`, attachment: fs.createReadStream(finalImg) });
      }
      g.turn = g.turn == g.playerX? g.playerO : g.playerX;
      let nextName = await getNameSafe(g.turn);
      return message.reply({body: `⭕ 𝗧𝗨𝗥𝗡: ${nextName}\n💰 Bet: $${formatMoney(g.bet)} | ⏰ 5min time`, attachment: fs.createReadStream(img)});
    }
    let p1 = event.senderID;
    let bet = parseBet(args[args.length-1], 0);
    if (!bet) return message.reply("❌ Bet amount dao\nEx: #ttt @tag 500b or #ttt @tag all");
    if (bet < MIN_BET) return message.reply(`❌ Min bet $1`);
    if (bet > MAX_BET) return message.reply(`❌ Max bet 20T`);
    let p2 = null;
    if (event.type == "message_reply") p2 = event.messageReply.senderID;
    else if (event.mentions && Object.keys(event.mentions).length > 0) p2 = Object.keys(event.mentions)[0];
    if (!p2) return message.reply("❌ Use: #ttt @tag 500b");
    if (p1 == p2) return message.reply("❌ Nijer sathe khela jabe na");
    let user1 = await BankUser.findOne({ userID: p1 }) || await BankUser.create({ userID: p1, balance: 1000 });
    let user2 = await BankUser.findOne({ userID: p2 }) || await BankUser.create({ userID: p2, balance: 1000 });
    if (user1.balance < bet) return message.reply(`❌ Tomar balance kom`);
    if (user2.balance < bet) return message.reply(`❌ Opponent er balance kom`);
    let name1 = await getNameSafe(p1);
    let name2 = await getNameSafe(p2);
    games[tid] = { board: ["1","2","3","4","5","6","7","8","9"], playerX: p1, playerO: p2, turn: p1, bet: bet };
    setGameTimer(tid, games[tid], usersData, api);
    let img = await drawBoardImage(games[tid].board, name1, name2, bet);
    return message.reply({ body: `🎮 𝗚𝗔𝗠𝗘 𝗦𝗧𝗔𝗥𝗧 - Bet: $${formatMoney(bet)}\n❌ = ${name1} $${formatMoney(user1.balance)}\n⭕ = ${name2} $${formatMoney(user2.balance)}\n🎯 First turn: ${name1}\n⏰ 5min er moddhe move dite hobe`, attachment: fs.createReadStream(img) });
  }
};
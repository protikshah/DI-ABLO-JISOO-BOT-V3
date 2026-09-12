const fs = require("fs");
const path = "./ludo_scores.json";

const ludoGames = {};
let topScores = {};
if(fs.existsSync(path)) topScores = JSON.parse(fs.readFileSync(path));

module.exports = {
  config: {
    name: "ludo",
    aliases: ["l"],
    version: "3.1.0",
    author: "Sazzad",
    countDown: 2,
    role: 0,
    shortDescription: "Ludo Multiplayer 10 player",
    category: "GAME"
  },
  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message && typeof message.reply === "function"? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const threadID = event.threadID;
    const userID = event.senderID;
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Player";

    if(args[0] == "top"){
      let scores = topScores[threadID] || [];
      if(scores.length == 0) return sendMsg("📊 Akhono kono win nai");
      scores.sort((a,b) => b.wins - a.wins);
      let msg = "🏆 Ludo Top 10:\n";
      for(let i = 0; i < Math.min(10, scores.length); i++){
        msg += `${i+1}. ${scores[i].name} : ${scores[i].wins}W\n`;
      }
      return sendMsg(msg);
    }

    if(args[0] == "end"){
      if(!ludoGames[threadID]) return sendMsg("❌ Kono game nai");
      const game = ludoGames[threadID];
      if(game.players[0].id!= userID) return sendMsg("❌ Shudhu host game end korte parbe");
      clearTimeout(game.timer);
      delete ludoGames[threadID];
      return sendMsg("🛑 Host game end kore dise");
    }

    if(args[0] == "create"){
      if(ludoGames[threadID]) return sendMsg("❌ Age ekta game cholche");
      let bet = parseInt(args[1]) || 0;
      const MIN_BET = 10;
      const MAX_BET = 100000;

      ludoGames[threadID] = {
        players: [{id: userID, name: userName, pos: 0, color: "🔴", miss: 0}],
        turn: 0,
        bet: bet,
        started: false,
        timer: null,
        over: false,
        maxPos: 51
      };
      let betMsg = bet > 0? `\n💰 Bet: $${formatMoney(bet)} | Win: $${formatMoney(bet*2)}` : "";
      return sendMsg(`🎲 Ludo Room Created!${betMsg}\nHost: ${userName} 🔴\n\nBaki ra #ludo join dao\nMax 10 player\n#ludo setpos 100 diye pos change\nHost #ludo end diye game cancel korte parbe\nHost #ludo start dile khela suru`);
    }

    if(args[0] == "join"){
      if(!ludoGames[threadID]) return sendMsg("❌ Kono room nai. #ludo create dao");
      const game = ludoGames[threadID];
      if(game.started) return sendMsg("❌ Game already start");
      if(game.players.find(p => p.id == userID)) return sendMsg("❌ Already join");
      if(game.players.length >= 10) return sendMsg("❌ Room full. Max 10");

      const colors = ["🟢","🟡","🔵","🟣","🟠","⚫","⚪","🟤","🩷"];
      game.players.push({id: userID, name: userName, pos: 0, color: colors[game.players.length-1], miss: 0});
      let list = game.players.map(p => `${p.color} ${p.name}`).join("\n");
      return sendMsg(`✅ ${userName} joined!\n\nPlayers:\n${list}\n\nHost #ludo start dao`);
    }

    if(args[0] == "setpos"){
      if(!ludoGames[threadID]) return sendMsg("❌ Room nai");
      const game = ludoGames[threadID];
      if(game.started) return sendMsg("❌ Game start er por pos change hobe na");
      if(game.players[0].id!= userID) return sendMsg("❌ Shudhu host pos change korte parbe");
      let pos = parseInt(args[1]);
      if(isNaN(pos) || pos < 10 || pos > 200) return sendMsg("❌ Pos 10-200 er moddhe dao");
      game.maxPos = pos;
      return sendMsg(`✅ Win Pos set: ${pos}`);
    }

    if(args[0] == "start"){
      if(!ludoGames[threadID]) return sendMsg("❌ Room nai");
      const game = ludoGames[threadID];
      if(game.started) return sendMsg("❌ Already start");
      if(game.players[0].id!= userID) return sendMsg("❌ Shudhu host start dite parbe");
      if(game.players.length < 2) return sendMsg("❌ Minimum 2 jon lagbe");

      game.started = true;
      let list = game.players.map(p => `${p.color} ${p.name}`).join(" vs ");
      sendMsg(`🎮 GAME START! Win Pos: ${game.maxPos}\n${list}\n\nFirst Turn: ${game.players[0].name}\n#l roll diye dice ghurao\nHost #ludo end diye game sesh korte parbe`);
      startTimer(threadID, sendMsg, api);
      return;
    }

    if(args[0] == "leave"){
      if(!ludoGames[threadID]) return sendMsg("❌ Room nai");
      const game = ludoGames[threadID];
      if(game.started) return sendMsg("❌ Game cholakalin leave kora jabe na");
      game.players = game.players.filter(p => p.id!= userID);
      if(game.players.length == 0) delete ludoGames[threadID];
      return sendMsg(`❌ ${userName} left the room`);
    }

    if(!ludoGames[threadID]) return sendMsg("❌ Room nai");
    const game = ludoGames[threadID];
    if(!game.started) return sendMsg("❌ Host #ludo start dao nai");
    if(game.over) return sendMsg("❌ Game sesh");

    let currentPlayer = game.players[game.turn];
    if(currentPlayer.id!= userID) return sendMsg(`❌ ${currentPlayer.name} er turn`);

    if(args[0] == "roll"){
      clearTimeout(game.timer);
      currentPlayer.miss = 0;
      let dice = Math.floor(Math.random() * 6) + 1;
      currentPlayer.pos += dice;
      if(currentPlayer.pos > game.maxPos) currentPlayer.pos = game.maxPos;

      let win = currentPlayer.pos >= game.maxPos;
      if(win){
        game.over = true;
        let winMoney = game.bet > 0? game.bet * 2 : 0;
        saveScore(threadID, currentPlayer.id, currentPlayer.name);
        delete ludoGames[threadID];
        return sendMsg(`🎉 WINNER: ${currentPlayer.name} ${currentPlayer.color}\n${winMoney > 0? `💰 Won: $${formatMoney(winMoney)}` : ""}`);
      }

      nextTurn(threadID, sendMsg, api);
    }
  }
};

function nextTurn(threadID, sendMsg, api){
  const game = ludoGames[threadID];
  if(!game || game.over) return;

  game.turn = (game.turn + 1) % game.players.length;
  let currentPlayer = game.players[game.turn];
  let board = game.players.map(p => `${p.color} ${p.name}: ${p.pos}/${game.maxPos} ${p.miss > 0? `(${p.miss} miss)` : ""}`).join("\n");
  sendMsg(`${board}\n\nNext: ${currentPlayer.name} er turn`);
  startTimer(threadID, sendMsg, api);
}

function startTimer(threadID, sendMsg, api){
  const game = ludoGames[threadID];
  if(!game) return;
  game.timer = setTimeout(() => {
    const game = ludoGames[threadID];
    if(!game) return;
    let currentPlayer = game.players[game.turn];
    currentPlayer.miss++;

    if(currentPlayer.miss >= 4){
      sendMsg(`⏰ ${currentPlayer.name} 4 bar miss! Out hoye gese`);
      game.players.splice(game.turn, 1);
      if(game.players.length <= 1){
        game.over = true;
        delete ludoGames[threadID];
        return sendMsg(`🎉 WINNER: ${game.players[0].name}`);
      }
      if(game.turn >= game.players.length) game.turn = 0;
    } else {
      sendMsg(`⏰ Time up! ${currentPlayer.name} miss: ${currentPlayer.miss}/4`);
      nextTurn(threadID, sendMsg, api);
      return;
    }
    nextTurn(threadID, sendMsg, api);
  }, 30000);
}

function saveScore(threadID, userID, name){
  if(!topScores[threadID]) topScores[threadID] = [];
  let user = topScores[threadID].find(u => u.userID == userID);
  if(user){
    user.wins++;
  } else {
    topScores[threadID].push({userID, name, wins: 1});
  }
  topScores[threadID].sort((a,b) => b.wins - a.wins);
  if(topScores[threadID].length > 10) topScores[threadID].pop();
  fs.writeFileSync(path, JSON.stringify(topScores));
}

function formatMoney(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}
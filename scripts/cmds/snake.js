const fs = require("fs");
const path = "./snake_scores.json";
const snakeGames = {};
let topScores = {};
if(fs.existsSync(path)) topScores = JSON.parse(fs.readFileSync(path));
module.exports = {
  config: {
    name: "snake",
    aliases: ["snk"],
    version: "1.2.0",
    author: "Sazzad",
    countDown: 0,
    role: 0,
    shortDescription: "Snake game with bet",
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
      if(scores.length == 0) return sendMsg("📊 Akhono kono score nai");
      scores.sort((a,b) => b.score - a.score);
      let msg = "🏆 Top 10 Scores:\n";
      for(let i = 0; i < Math.min(10, scores.length); i++){
        msg += `${i+1}. ${scores[i].name} : ${scores[i].score}\n`;
      }
      return sendMsg(msg);
    }
    if(args[0] == "start"){
      let bet = parseInt(args[1]) || 0;
      const MIN_BET = 10;
      const MAX_BET = 100000;
      let userScore = getUserScore(threadID, userID);
      let maxBetByScore = Math.floor((userScore / 5) * 3);
      let allowedMaxBet = Math.min(MAX_BET, maxBetByScore || MAX_BET);
      if(bet > 0){
        if(bet < MIN_BET) return sendMsg(`❌ Min bet $${MIN_BET}`);
        if(bet > allowedMaxBet) return sendMsg(`❌ Max bet $${formatMoney(allowedMaxBet)}`);
      }
      snakeGames[threadID] = {
        snake: [[5,5]],
        dir: "d",
        food: [Math.floor(Math.random()*10), Math.floor(Math.random()*10)],
        score: 0,
        over: false,
        bet: bet,
        userID: userID,
        userName: userName
      };
      let betMsg = bet > 0? `\n💰 Bet: $${formatMoney(bet)} | Win: $${formatMoney(bet*2)}` : "";
      return sendMsg(`🐍 Snake Game Start!${betMsg}\nScore: 0\n${drawBoard(snakeGames[threadID])}\n\nw=up s=down a=left d=right`);
    }
    if(!snakeGames[threadID]) return sendMsg("❌ Age #snake start dao");
    const game = snakeGames[threadID];
    if(game.over) return sendMsg("❌ Game sesh. Abar #snake start dao");
    let dir = args[0];
    let steps = 1;
    if(dir && dir.length > 1){
      steps = dir.length;
      dir = dir[0];
    }
    if(dir == "w") game.dir = "w";
    if(dir == "s") game.dir = "s";
    if(dir == "a") game.dir = "a";
    if(dir == "d") game.dir = "d";
    for(let s = 0; s < steps; s++){
      const head = game.snake[0];
      let newHead = [...head];
      if(game.dir == "w") newHead[0]--;
      if(game.dir == "s") newHead[0]++;
      if(game.dir == "a") newHead[1]--;
      if(game.dir == "d") newHead[1]++;
      if(newHead[0] < 0 || newHead[0] > 9 || newHead[1] < 0 || newHead[1] > 9){
        game.over = true;
        let finalScore = game.score;
        let winMoney = game.bet > 0? game.bet * 2 : 0;
        saveScore(threadID, userID, game.userName, finalScore);
        return sendMsg(`💀 Game Over!\nScore: ${finalScore}${winMoney > 0? `\n💰 Won: $${formatMoney(winMoney)}` : ""}\n\n${drawBoard(game)}`);
      }
      for(let part of game.snake){
        if(part[0] == newHead[0] && part[1] == newHead[1]){
          game.over = true;
          let finalScore = game.score;
          let winMoney = game.bet > 0? game.bet * 2 : 0;
          saveScore(threadID, userID, game.userName, finalScore);
          return sendMsg(`💀 Game Over!\nScore: ${finalScore}${winMoney > 0? `\n💰 Won: $${formatMoney(winMoney)}` : ""}\n\n${drawBoard(game)}`);
        }
      }
      game.snake.unshift(newHead);
      if(newHead[0] == game.food[0] && newHead[1] == game.food[1]){
        game.score++;
        game.food = [Math.floor(Math.random()*10), Math.floor(Math.random()*10)];
      } else {
        game.snake.pop();
      }
    }
    return sendMsg(`Score: ${game.score}\n\n${drawBoard(game)}`);
  }
};
function saveScore(threadID, userID, name, score){
  if(!topScores[threadID]) topScores[threadID] = [];
  let user = topScores[threadID].find(u => u.userID == userID);
  if(user){
    if(score > user.score) user.score = score;
  } else {
    topScores[threadID].push({userID, name, score});
  }
  topScores[threadID].sort((a,b) => b.score - a.score);
  if(topScores[threadID].length > 10) topScores[threadID].pop();
  fs.writeFileSync(path, JSON.stringify(topScores));
}
function getUserScore(threadID, userID){
  let scores = topScores[threadID] || [];
  let user = scores.find(u => u.userID == userID);
  return user? user.score : 0;
}
function formatMoney(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}
function drawBoard(game){
  let board = "";
  for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
      let char = "⬜";
      for(let s of game.snake) if(s[0] == i && s[1] == j) char = "🟩";
      if(game.food[0] == i && game.food[1] == j) char = "🍎";
      board += char;
    }
    board += "\n";
  }
  return board;
}
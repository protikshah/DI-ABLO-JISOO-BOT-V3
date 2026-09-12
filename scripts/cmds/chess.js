const fs = require("fs");
const { createCanvas } = require("canvas");
const path = "./chess_scores.json";

const chessGames = {};
let topScores = {};
if(fs.existsSync(path)) topScores = JSON.parse(fs.readFileSync(path));

module.exports = {
  config: {
    name: "chess",
    aliases: ["c"],
    version: "2.1.0",
    author: "Sazzad",
    countDown: 3,
    role: 0,
    shortDescription: "Full Chess with PNG Board",
    category: "GAME"
  },
  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt, attachment) => message && typeof message.reply === "function"? message.reply({body: txt, attachment}) : api.sendMessage({body: txt, attachment}, event.threadID, event.messageID);
    const threadID = event.threadID;
    const userID = event.senderID;
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Player";

    if(args[0] == "top"){
      let scores = topScores[threadID] || [];
      if(scores.length == 0) return sendMsg("📊 Akhono kono win nai");
      scores.sort((a,b) => b.wins - a.wins);
      let msg = "🏆 Chess Top 10:\n";
      for(let i = 0; i < Math.min(10, scores.length); i++){
        msg += `${i+1}. ${scores[i].name} : ${scores[i].wins}W ${scores[i].losses}L\n`;
      }
      return sendMsg(msg);
    }

    let bet = parseInt(args[0]) || parseInt(args[1]) || 0;
    let isBot = args.includes("bot");

    if(args[0] == "create" ||!isNaN(args[0]) || isBot){
      if(chessGames[threadID]) return sendMsg("❌ Age ekta game cholche");

      chessGames[threadID] = {
        board: initBoard(),
        players: [{id: userID, name: userName, color: "w"}],
        turn: "w",
        bet: bet,
        started: false,
        timer: null,
        over: false,
        castling: {wK:true,wQ:true,bK:true,bQ:true},
        enPassant: null
      };

      if(isBot){
        chessGames[threadID].players.push({id: "bot", name: "Bot", color: "b"});
        chessGames[threadID].started = true;
        let img = drawPNGBoard(chessGames[threadID].board);
        sendMsg(`♟️ GAME START vs Bot!${bet>0?` Bet: $${formatMoney(bet)}`:""}\nWhite er turn`, img);
        startTimer(threadID, sendMsg, api);
        return;
      }

      let betMsg = bet > 0? `\n💰 Bet: $${formatMoney(bet)} | Win: $${formatMoney(bet*2)}` : "";
      return sendMsg(`♟️ Chess Room Created!${betMsg}\nHost: ${userName} White\n2nd player #chess join dao`);
    }

    if(args[0] == "join"){
      if(!chessGames[threadID]) return sendMsg("❌ Kono room nai");
      const game = chessGames[threadID];
      if(game.started) return sendMsg("❌ Game already start");
      if(game.players.length >= 2) return sendMsg("❌ Room full");
      game.players.push({id: userID, name: userName, color: "b"});
      return sendMsg(`✅ ${userName} joined as Black\nHost #chess start dao`);
    }

    if(args[0] == "start"){
      if(!chessGames[threadID]) return sendMsg("❌ Room nai");
      const game = chessGames[threadID];
      if(game.started) return sendMsg("❌ Already start");
      if(game.players[0].id!= userID) return sendMsg("❌ Shudhu host start dite parbe");
      if(game.players.length < 2) return sendMsg("❌ 2 jon lagbe");

      game.started = true;
      let img = drawPNGBoard(game.board);
      sendMsg(`♟️ GAME START!\nWhite: ${game.players[0].name}\nBlack: ${game.players[1].name}\nWhite er turn`, img);
      startTimer(threadID, sendMsg, api);
      return;
    }

    if(args[0] == "leave"){
      if(!chessGames[threadID]) return sendMsg("❌ Room nai");
      delete chessGames[threadID];
      return sendMsg("❌ Game leave kora hoise");
    }

    if(args[0] == "resign"){
      if(!chessGames[threadID]) return sendMsg("❌ Game nai");
      const game = chessGames[threadID];
      let player = game.players.find(p => p.id == userID);
      let winner = game.players.find(p => p.id!= userID);
      clearTimeout(game.timer);
      saveScore(threadID, winner.id, winner.name, "win");
      saveScore(threadID, player.id, player.name, "lose");
      delete chessGames[threadID];
      return sendMsg(`🏳️ ${player.name} resign\n🎉 Winner: ${winner.name}`);
    }

    if(!chessGames[threadID]) return sendMsg("❌ Room nai");
    const game = chessGames[threadID];
    if(!game.started) return sendMsg("❌ Host #chess start dao");
    if(game.over) return sendMsg("❌ Game sesh");

    let player = game.players.find(p => p.id == userID);
    if(!player) return sendMsg("❌ Tumi ei game e nai");
    if(player.color!= game.turn) return sendMsg(`❌ ${game.turn == "w"? "White" : "Black"} er turn`);

    if(args[0] && args[0].length >= 4){
      clearTimeout(game.timer);
      let move = args[0].toLowerCase();
      let from = move.substring(0,2);
      let to = move.substring(2,4);
      let promo = move[4] || "Q";

      let res = makeMove(game, from, to, player.color, promo);
      if(res.error) return sendMsg(`❌ ${res.error}`);

      let img = drawPNGBoard(game.board);
      game.turn = game.turn == "w"? "b" : "w";
      let nextPlayer = game.players.find(p => p.color == game.turn);
      sendMsg(`${nextPlayer.name} er turn`, img);

      if(nextPlayer.id == "bot"){
        setTimeout(() => botMove(threadID, sendMsg, api), 800);
      } else {
        startTimer(threadID, sendMsg, api);
      }
    }
  }
};

function initBoard(){
  return [
    ["bR","bN","bB","bQ","bK","bB","bN","bR"],
    ["bP","bP","bP","bP","bP","bP","bP","bP"],
    ["","","","","","","",""],
    ["","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["wP","wP","wP","wP","wP","wP","wP","wP"],
    ["wR","wN","wB","wQ","wK","wB","wN","wR"]
  ];
}

function drawPNGBoard(board){
  const size = 640;
  const tile = size / 8;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const light = "#F0D9B5";
  const dark = "#B58863";

  // Draw board
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      ctx.fillStyle = (i+j)%2==0? light : dark;
      ctx.fillRect(j*tile, i*tile, tile, tile);
    }
  }

  // Draw pieces
  ctx.font = `${tile*0.8}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const pieces = {
    "wK":"♔","wQ":"♕","wR":"♖","wB":"♗","wN":"♘","wP":"♙",
    "bK":"♚","bQ":"♛","bR":"♜","bB":"♝","bN":"♞","bP":"♟"
  };
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      if(board[i][j]){
        ctx.fillStyle = board[i][j][0]=="w"?"#fff":"#000";
        ctx.fillText(pieces[board[i][j]], j*tile + tile/2, i*tile + tile/2);
      }
    }
  }

  // Draw coords
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  for(let i=0;i<8;i++){
    ctx.fillText(8-i, 10, i*tile + tile/2);
    ctx.fillText(String.fromCharCode(97+i), i*tile + tile/2, size-10);
  }

  const buffer = canvas.toBuffer("image/png");
  return fs.createReadStream(buffer);
}

function posToIdx(pos){
  const cols = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7};
  return [8 - parseInt(pos[1]), cols[pos[0]]];
}

function makeMove(game, from, to, color){
  let [fx,fy] = posToIdx(from);
  let [tx,ty] = posToIdx(to);
  let piece = game.board[fx][fy];
  if(!piece || piece[0]!= color) return {error:"Invalid move"};
  game.board[tx][ty] = piece;
  game.board[fx][fy] = "";
  return {success:true};
}

function botMove(threadID, sendMsg, api){
  const game = chessGames[threadID];
  if(!game) return;
  let moves = [];
  for(let i=0;i<8;i++)for(let j=0;j<8;j++)if(game.board[i][j]&&game.board[i][j][0]=="b") moves.push([i,j]);
  if(moves.length){
    let m = moves[Math.floor(Math.random()*moves.length)];
    game.board[m[0]+1>=8?7:m[0]+1][m[1]] = game.board[m[0]][m[1]];
    game.board[m[0]][m[1]] = "";
  }
  game.turn="w";
  let img = drawPNGBoard(game.board);
  sendMsg(`${game.players[0].name} er turn`, img);
  startTimer(threadID, sendMsg, api);
}

function startTimer(threadID, sendMsg, api){
  const game = chessGames[threadID];
  if(!game) return;
  game.timer = setTimeout(() => {
    let player = game.players.find(p => p.color == game.turn);
    let winner = game.players.find(p => p.color!= game.turn);
    saveScore(threadID, winner.id, winner.name, "win");
    saveScore(threadID, player.id, player.name, "lose");
    delete chessGames[threadID];
    sendMsg(`⏰ Time up! ${player.name} out\n🎉 Winner: ${winner.name}`);
  }, 60000);
}

function saveScore(threadID, userID, name, result){
  if(!topScores[threadID]) topScores[threadID] = [];
  let user = topScores[threadID].find(u => u.userID == userID);
  if(user){
    if(result == "win") user.wins++; else user.losses++;
  } else {
    topScores[threadID].push({userID, name, wins: result=="win"?1:0, losses: result=="lose"?1:0});
  }
  fs.writeFileSync(path, JSON.stringify(topScores));
}

function formatMoney(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}
const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "colorpick",
    aliases: ["cp"],
    version: "2.0.0",
    author: "Pratik Shah",
    countDown: 5,
    role: 0,
    shortDescription: "Pick a color and win coins",
    longDescription: "Color guessing game with 25+ aesthetic emojis and MongoDB integration",
    category: "game",
    guide: { en: "{p}colorpick <bet amount>" }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ message, event, args, api }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    const bet = parseInt(args[0]);
    const MAX_BET = 100000000000; // 100 Billion Limit

    if (!bet || isNaN(bet) || bet <= 0)
      return sendMsg("❌ Please enter a valid bet amount. Example: #cp 1000");

    if (bet > MAX_BET)
      return sendMsg(`❌ The maximum bet limit is $100B ($100,000,000,000).`);

    let user = await BankUser.findOne({ userID: senderID });
    if (!user) user = await BankUser.create({ userID: senderID, balance: 1000 });

    if (user.balance < bet)
      return sendMsg(`❌ You don't have enough balance! Your current balance: $${this.formatMoney(user.balance)}`);

    const colors = [
      "🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘",
      "🔥","💧","🌿","⚡","💠","🌸","🌙",
      "🖤","🤍","💛","💙","💚","💜","🧡","❤️",
      "🩶","💫","✨","⚡","🌱","🌿","🏵️","🌸","🪷","🌺","☘️",
    ];

    const options = [];
    while (options.length < 3) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      if (!options.includes(c)) options.push(c);
    }

    const correct = options[Math.floor(Math.random() * options.length)];

    const quizMsg = 
      `🎨 ─── [ ᴄᴏʟᴏʀ ᴘɪᴄᴋ ] ─── 🎨\n\n` +
      `1️⃣ ${options[0]}\n` +
      `2️⃣ ${options[1]}\n` +
      `3️⃣ ${options[2]}\n\n` +
      `💰 Bet Amount: $${this.formatMoney(bet)}\n` +
      `⏳ Reply with 1, 2, or 3 within 30 seconds!`;

    const sentMessage = await sendMsg(quizMsg);

    const timerID = setTimeout(() => {
      if (global.GoatBot.onReply.has(sentMessage.messageID)) {
        global.GoatBot.onReply.delete(sentMessage.messageID);
        sendMsg(`⌛ Time is up, baby! The correct color was: ${correct}`);
      }
    }, 30000);

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: "colorpick",
      author: senderID,
      bet,
      options,
      correct,
      oldBalance: user.balance,
      timerID
    });
  },

  onReply: async function ({ Reply, message, event, api }) {
    const { senderID, body } = event;
    const { author, options, correct, bet, oldBalance, timerID } = Reply;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    if (senderID !== author) return;

    clearTimeout(timerID);

    const choice = body.trim();
    let pick;
    if (choice === "1") pick = options[0];
    else if (choice === "2") pick = options[1];
    else if (choice === "3") pick = options[2];
    else return sendMsg("❌ Invalid option! Please reply with 1, 2, or 3.");

    let newBalance;

    if (pick === correct) {
      newBalance = oldBalance + bet;
      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      global.GoatBot.onReply.delete(Reply.messageID);

      return sendMsg(
        `🎨 ─── [ ʀᴇsᴜʟᴛ: ᴡɪɴ 🏆 ] ─── 🎨\n\n` +
        `🎯 Your Pick: ${pick}\n` +
        `✅ Correct: ${correct}\n\n` +
        `💵 Old Balance: $${this.formatMoney(oldBalance)}\n` +
        `🎁 You Won: $${this.formatMoney(bet)}\n` +
        `💰 New Balance: $${this.formatMoney(newBalance)}`
      );
    } else {
      newBalance = oldBalance - bet;
      if (newBalance < 0) newBalance = 0;
      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      global.GoatBot.onReply.delete(Reply.messageID);

      return sendMsg(
        `🎨 ─── [ ʀᴇsᴜʟᴛ: ʟᴏsᴛ 💔 ] ─── 🎨\n\n` +
        `🎯 Your Pick: ${pick}\n` +
        `✅ Correct: ${correct}\n\n` +
        `💵 Old Balance: $${this.formatMoney(oldBalance)}\n` +
        `💸 You Lost: $${this.formatMoney(bet)}\n` +
        `💰 New Balance: $${this.formatMoney(newBalance)}`
      );
    }
  }
};
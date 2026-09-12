const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});
const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

let games = {};

module.exports = {
  config: {
    name: "guessbet",
    aliases: ["gb", "guess"],
    version: "v2.0",
    author: "Sazzad",
    countDown: 3,
    role: 0,
    shortDescription: "Bet kore number guess",
    longDescription: "1B jitle, -100m harle",
    category: "game",
    guide: { en: "{p}guessbet start | {p}guessbet 50" }
  },

  formatMoney: function (num) {
    if (num >= 1000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message.reply(txt);
    const threadID = event.threadID;
    const userID = event.senderID;

    let user = await BankUser.findOne({ userID });
    if (!user) user = await BankUser.create({ userID, balance: 1000 });

    if (!args[0] || args[0] === "start") {
      if (user.balance < 100000) {
        return sendMsg(`💸 Balance kom! Khelte minimum 100M lagbe\nTor balance: $${this.formatMoney(user.balance)}`);
      }
      const number = Math.floor(Math.random() * 100) + 1;
      games[threadID] = { number, tries: 0, player: userID };
      return sendMsg(`🎰 BET GAME START\nBet: 100M\nJitle: +1B 🔥\nHarle: -100M 💀\n\n1-100 er moddhe guess koro: #guessbet 50`);
    }

    if (!games[threadID] || games[threadID].player!== userID) {
      return sendMsg(`Age #guessbet start koro`);
    }

    const guess = parseInt(args[0]);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return sendMsg(`1-100 er moddhe number dao`);
    }

    games[threadID].tries++;
    const correct = games[threadID].number;

    if (guess === correct) {
      user.balance += 1000000000;
      await user.save();
      const tries = games[threadID].tries;
      delete games[threadID];
      return sendMsg(`🎉 JITE GESOS! 🎉\nNumber: ${correct}\nTry: ${tries}\n\n💰 +1B\nNew Balance: $${this.formatMoney(user.balance)}`);
    }

    if (games[threadID].tries >= 5) {
      user.balance -= 100000000;
      await user.save();
      delete games[threadID];
      return sendMsg(`💀 HARSO! 💀\nNumber chilo: ${correct}\n\n💸 -100M\nNew Balance: $${this.formatMoney(user.balance)}`);
    }

    if (guess < correct) {
      return sendMsg(`⬆️ Beshi hobe! ${guess} er theke boro\nTry: ${games[threadID].tries}/5`);
    } else {
      return sendMsg(`⬇️ Kom hobe! ${guess} er theke choto\nTry: ${games[threadID].tries}/5`);
    }
  }
};
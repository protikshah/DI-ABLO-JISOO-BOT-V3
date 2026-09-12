const mongoose = require("mongoose");

// Mongoose Schema with strict field initialization
const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 },
  slotWins: { type: Number, default: 0 },
  slotTotal: { type: Number, default: 0 },
  lastSlotDate: { type: String, default: "" },
  slotCount: { type: Number, default: 0 },
  slotWindowStart: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "slot0",
    aliases: ["slo#ts"],
    version: "1.4.0",
    author: "DI-ABLO JI-SOO",
    countDown: 10,
    role: 0,
    shortDescription: "Play casino slot game (Max Bet: $100B)",
    category: "game",
    guide: { en: "{p}slot [amount / 2m / 5k / 100b / all]" }
  },

  parseAmount: function (str, userBalance) {
    if (!str) return null;
    str = str.toLowerCase().trim();
    if (str === "all") return userBalance;

    const match = str.match(/^(\d+(\.\d+)?)\s*([kmb])?$/);
    if (!match) return null;

    let value = parseFloat(match[1]);
    const unit = match[3];

    if (unit === "k") value *= 1000;
    else if (unit === "m") value *= 1000000;
    else if (unit === "b") value *= 1000000000;

    return Math.floor(value);
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      let user = await BankUser.findOne({ userID: senderID });
      if (!user) {
        user = await BankUser.create({ userID: senderID, balance: 1000 });
      }

      if (!args[0]) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ. ᴇxᴀᴍᴘʟᴇ: #sʟᴏᴛ 2ᴍ / #sʟᴏᴛ 100ʙ");
      }

      const betAmount = this.parseAmount(args[0], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      const MAX_BET = 100000000000; // 100 Billion Limit
      if (betAmount > MAX_BET) {
        return sendMsg(`❌ ᴍᴀxɪᴍᴜᴍ ʙᴇᴛ ʟɪᴍɪᴛ ɪs $100ʙ (${this.formatMoney(MAX_BET)}).`);
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      // 5 Hours Cooldown & 30 Spins Limit Logic
      const now = Date.now();
      const FIVE_HOURS = 5 * 60 * 60 * 1000;

      let windowStart = user.slotWindowStart || 0;
      let currentCount = user.slotCount || 0;

      if (!windowStart || (now - windowStart) > FIVE_HOURS) {
        windowStart = now;
        currentCount = 0;
      }

      if (currentCount >= 30) {
        const remainingMs = FIVE_HOURS - (now - windowStart);
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        const hours = Math.floor(remainingMins / 60);
        const mins = remainingMins % 60;

        const timeStr = hours > 0 ? `${hours}ʜ ${mins}ᴍ` : `${mins}ᴍ`;
        return sendMsg(`❌ ʏᴏᴜ ʜᴀᴠᴇ ʀᴇᴀᴄʜᴇᴅ ᴛʜᴇ ʟɪᴍɪᴛ ᴏғ 30 sᴘɪɴs ᴘᴇʀ 5 ʜᴏᴜʀs.\n⏳ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ${timeStr} ᴛᴏ ᴘʟᴀʏ ᴀɢᴀɪɴ.`);
      }

      // Daily Reset Check
      const today = new Date().toISOString().slice(0, 10);
      let wins = user.slotWins || 0;
      let total = user.slotTotal || 0;

      if (user.lastSlotDate !== today) {
        wins = 0;
        total = 0;
      }

      // Heart Icons for Slot
      const items = ["💜", "❤️", "🤍", "💚", "💛", "💙"];
      const icon1 = items[Math.floor(Math.random() * items.length)];
      const icon2 = items[Math.floor(Math.random() * items.length)];
      const icon3 = items[Math.floor(Math.random() * items.length)];

      let winMultiplier = 0;
      if (icon1 === icon2 && icon2 === icon3) {
        winMultiplier = 3;
      } else if (icon1 === icon2 || icon1 === icon3 || icon2 === icon3) {
        winMultiplier = 2;
      }

      total += 1;
      currentCount += 1;
      let resultText = "";
      let newBalance = user.balance;

      if (winMultiplier > 0) {
        wins += 1;
        const prize = betAmount * winMultiplier;
        newBalance = user.balance + (prize - betAmount);
        resultText = `• ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(prize)}`;
      } else {
        newBalance = user.balance - betAmount;
        resultText = `• ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      // Explicit MongoDB Update
      await BankUser.updateOne(
        { userID: senderID },
        {
          $set: {
            balance: newBalance,
            slotWins: wins,
            slotTotal: total,
            lastSlotDate: today,
            slotCount: currentCount,
            slotWindowStart: windowStart
          }
        }
      );

      const winRate = ((wins / total) * 100).toFixed(1);

      const response = `> 🎀\n` +
        `${resultText}\n` +
        `• ɢᴀᴍᴇ ʀᴇsᴜʟᴛs: [ ${icon1} | ${icon2} | ${icon3} ]\n\n` +
        `🎯 ᴡɪɴ ʀᴀᴛᴇ ᴛᴏᴅᴀʏ: ${winRate}% (${wins}/${total})\n` +
        `🎰 sᴘɪɴs ʟᴇғᴛ (5ʜ): ${30 - currentCount}/30`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ sʟᴏᴛ ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
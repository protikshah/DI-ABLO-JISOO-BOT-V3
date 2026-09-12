const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay"],
    version: "1.2.0",
    author: "Pratik Shah",
    countDown: 2,
    role: 0,
    shortDescription: "Send money to another user",
    category: "economy",
    guide: { en: "{p}sendmoney [@user / reply] [amount / 100b / all]" }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    let targetID = null;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID || targetID === senderID) {
      return sendMsg("❌ ʏᴏᴜ ᴍᴜsᴛ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀɴᴏᴛʜᴇʀ ᴜsᴇʀ ᴛᴏ sᴇɴᴅ ᴍᴏɴᴇʏ.");
    }

    try {
      let sender = await BankUser.findOne({ userID: senderID });
      if (!sender) sender = await BankUser.create({ userID: senderID, balance: 1000, loan: 0 });

      const parseAmount = (input) => {
        if (!input) return NaN;
        const lower = input.toLowerCase().trim();
        if (lower === "all") return sender.balance;
        if (lower.endsWith("k")) return parseFloat(lower) * 1000;
        if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
        if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
        return parseInt(input);
      };

      const amount = parseAmount(args[args.length - 1]);

      if (isNaN(amount) || amount <= 0) {
        return sendMsg("❌ ᴜsᴀɢᴇ: {p}sᴇɴᴅᴍᴏɴᴇʏ [@ᴜsᴇʀ / ʀᴇᴘʟʏ] [ᴀᴍᴏᴜɴᴛ / 100ʙ / ᴀʟʟ]");
      }

      if (sender.balance < amount) {
        return sendMsg(
          `❌ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ ғᴀɪʟᴇᴅ. ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ!\n` +
          `💰 ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ: $${sender.balance.toLocaleString()}`
        );
      }

      let target = await BankUser.findOne({ userID: targetID });
      if (!target) target = await BankUser.create({ userID: targetID, balance: 1000, loan: 0 });

      sender.balance -= amount;
      target.balance += amount;

      await sender.save();
      await target.save();

      let senderName = senderID;
      let targetName = targetID;

      if (usersData && typeof usersData.getName === "function") {
        try {
          senderName = await usersData.getName(senderID);
          targetName = await usersData.getName(targetID);
        } catch (e) {
          senderName = senderID;
          targetName = targetID;
        }
      }

      return sendMsg(`💸 ─── [ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ sᴜᴄᴄᴇssғᴜʟ ] ─── 💸\n\n` +
        `📤 sᴇɴᴅᴇʀ: ${senderName}\n` +
        `📥 ʀᴇᴄᴇɪᴠᴇʀ: ${targetName}\n` +
        `💵 ᴀᴍᴏᴜɴᴛ: $${amount.toLocaleString()} ($${this.formatMoney(amount)})\n` +
        `💰 ʏᴏᴜʀ ʀᴇᴍᴀɪɴɪɴɢ ʙᴀʟᴀɴᴄᴇ: $${sender.balance.toLocaleString()}`
      );
    } catch (err) {
      console.error("SendMoney Error:", err);
      return sendMsg("❌ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ ғᴀɪʟᴇᴅ.");
    }
  }
};

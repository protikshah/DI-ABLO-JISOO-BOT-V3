const axios = require("axios");
const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "animequiz",
    aliases: ["aniqz"],
    version: "2.0.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    shortDescription: "Guess the anime character name to win $500M",
    category: "game",
    guide: {
      en: "{p}animequiz - Start the anime character quiz"
    }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onReply: async function ({ api, event, Reply, message }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      const { aniqzNames, author } = Reply;
      const rewardCoin = 500000000; // Fixed Quiz Reward: $500 Million

      if (event.senderID !== author) {
        return sendMsg("❌ ʙᴀʙʏ, ᴛʜɪs ɪs ɴᴏᴛ ʏᴏᴜʀ ɢᴀᴍᴇ! sᴛᴀʀᴛ ʏᴏᴜʀ ᴏᴡɴ ǫᴜɪᴢ.");
      }

      const reply = event.body.trim().toLowerCase();
      await api.unsendMessage(Reply.messageID);

      const isCorrect = aniqzNames.some(name => reply.includes(name.toLowerCase()));

      if (isCorrect) {
        let user = await BankUser.findOne({ userID: event.senderID });
        if (!user) user = await BankUser.create({ userID: event.senderID, balance: 1000 });

        const newBalance = user.balance + rewardCoin;
        await BankUser.updateOne({ userID: event.senderID }, { $set: { balance: newBalance } });

        global.GoatBot.onReply.delete(Reply.messageID);

        const response = `✨ ─── [ ᴀɴɪᴍᴇ ǫᴜɪᴢ ] ─── ✨\n\n` +
          `✅ ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ, ʙᴀʙʏ!\n` +
          `🎁 ʏᴏᴜ ᴡᴏɴ: $${this.formatMoney(rewardCoin)}\n\n` +
          `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

        return sendMsg(response);
      } else {
        global.GoatBot.onReply.delete(Reply.messageID);

        const response = `✨ ─── [ ᴀɴɪᴍᴇ ǫᴜɪᴢ ] ─── ✨\n\n` +
          `💔 ᴡʀᴏɴɢ ᴀɴsᴡᴇʀ, ʙᴀʙʏ!\n` +
          `💡 ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ: ${aniqzNames.join(", ")}`;

        return sendMsg(response);
      }
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ᴀɴɪᴍᴇ ǫᴜɪᴢ ᴇʀʀᴏʀ!");
    }
  },

  onStart: async function ({ api, event, message }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      const apiUrl = await baseApiUrl();
      if (!apiUrl) return sendMsg("❌ ᴀᴘɪ ᴜʀʟ ɴᴏᴛ ғᴏᴜɴᴅ!");

      const response = await axios.get(`${apiUrl}/api/aniqz`);
      const { name, imgurLink } = response.data.aniqz;

      const aniqzNames = Array.isArray(name) ? name : [name];

      const imageStream = await axios({
        method: "GET",
        url: imgurLink,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const startMsg = `✨ ─── [ ᴀɴɪᴍᴇ ǫᴜɪᴢ ] ─── ✨\n\n` +
        `🖼️ ᴀ ʀᴀɴᴅᴏᴍ ᴀɴɪᴍᴇ ᴄʜᴀʀᴀᴄᴛᴇʀ ʜᴀs ᴀᴘᴘᴇᴀʀᴇᴅ!\n` +
        `🎁 ʀᴇᴡᴀʀᴅ: $500ᴍ\n\n` +
        `💬 ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ᴄʜᴀʀᴀᴄᴛᴇʀ ɴᴀᴍᴇ, ʙᴀʙʏ.`;

      return api.sendMessage(
        {
          body: startMsg,
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return sendMsg("❌ ғᴀɪʟᴇᴅ ᴛᴏ sᴇɴᴅ ᴄʜᴀʀᴀᴄᴛᴇʀ ɪᴍᴀɢᴇ.");

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            aniqzNames
          });

          setTimeout(() => {
            if (global.GoatBot.onReply.has(info.messageID)) {
              global.GoatBot.onReply.delete(info.messageID);
              api.unsendMessage(info.messageID);
            }
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error("AnimeQuiz Error:", error.message);
      return sendMsg(`❌ ᴇʀʀᴏʀ: ${error.message}`);
    }
  }
};
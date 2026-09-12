const axios = require("axios");
const mongoose = require("mongoose");

// Diablo Bank Mongo Schema
const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "football2",
    aliases: ["fball2", "footqz2", "footballqz2"],
    version: "2.1.0",
    author: "Pratik Shah",
    countDown: 10,
    role: 0,
    category: "game",
    shortDescription: "Football trivia quiz with Diablo Bank rewards",
    guide: { en: "{pn} [en/bn]" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args[0]?.toLowerCase() || "bn";
      const category = (input === "en" || input === "english") ? "english" : "bangla";

      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/api/football2?category=${category}`);
      const quiz = res.data?.data || res.data;

      if (!quiz || !quiz.question) {
        return api.sendMessage("❌ No quiz available for this category.", event.threadID, event.messageID);
      }

      const { question, correctAnswer, options } = quiz;
      const { a, b, c, d } = options;

      const quizMsg = {
        body: `⚽ ─── [ ғᴏᴏᴛʙᴀʟʟ ᴛʀɪᴠɪᴀ ǫᴜɪᴢ ] ─── ⚽\n\n` +
              `╭──✦ ${question}\n` +
              `├‣ 𝗔) ${a}\n` +
              `├‣ 𝗕) ${b}\n` +
              `├‣ 𝗖) ${c}\n` +
              `├‣ 𝗗) ${d}\n` +
              `╰──────────────────‣\n` +
              `👉 Reply with option (A/B/C/D) or full answer.`
      };

      api.sendMessage(quizMsg, event.threadID, (err, info) => {
        if (err) return;

        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            correctAnswer,
            messageID: info.messageID
          });
        }

        setTimeout(() => api.unsendMessage(info.messageID).catch(() => {}), 40000);
      }, event.messageID);
    } catch (error) {
      console.error("Football2 Error:", error);
      api.sendMessage("❌ Failed to load trivia question.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    const { correctAnswer, author, messageID } = Reply;
    const rewardCoins = 500000; // Reward Amount ($500K)

    if (event.senderID !== author) {
      return api.sendMessage("⚠️ ᴛʜɪs ǫᴜɪᴢ ɪs ɴᴏᴛ ʏᴏᴜʀs, ʙʀᴏ!", event.threadID, event.messageID);
    }

    if (messageID) {
      api.unsendMessage(messageID).catch(() => {});
    }

    const userReply = event.body.trim().toLowerCase();
    const correct = correctAnswer.toLowerCase();

    if (userReply === correct || userReply === correct[0]) {
      try {
        let user = await BankUser.findOne({ userID: author });
        if (!user) {
          user = await BankUser.create({ userID: author, balance: 1000, loan: 0 });
        }

        user.balance += rewardCoins;
        await user.save();

        return api.sendMessage(
          `✅ ─── [ ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ ] ─── ✅\n\n` +
          `💰 ʙᴀɴᴋ ʀᴇᴡᴀʀᴅ: +$${rewardCoins.toLocaleString()}\n` +
          `💳 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${user.balance.toLocaleString()}`,
          event.threadID,
          event.messageID
        );
      } catch (err) {
        console.error("Football2 DB Error:", err);
        return api.sendMessage("✅ Correct answer! (Failed to update Diablo Bank balance)", event.threadID, event.messageID);
      }
    } else {
      return api.sendMessage(
        `❌ ─── [ ᴡʀᴏɴɢ ᴀɴsᴡᴇʀ ] ─── ❌\n\n` +
        `⚽ ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ ᴡᴀs: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
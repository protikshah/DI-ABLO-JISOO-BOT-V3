const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongoose = require("mongoose");

// Database Schema
const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
}, { strict: false });

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

// Memory Tracker for Active PvP Challenges & Cooldowns
global.penaltyGames = global.penaltyGames || {
  challenges: new Map(),
  cooldowns: new Map()
};

const VIDEOS = {
  goal: {
    left: "https://files.catbox.moe/dunjkw.mp4",
    center: "https://files.catbox.moe/kxbwc2.mp4",
    right: "https://files.catbox.moe/13ohwi.mp4"
  },
  save: {
    left: "https://files.catbox.moe/kfcjjb.mp4",
    center: "https://files.catbox.moe/3ftsa9.mp4",
    right: "https://files.catbox.moe/kxfa83.mp4"
  }
};

const BOT_USER_ID = "BOT_DIABLO_OFFICIAL";

module.exports = {
  config: {
    name: "penalty",
    aliases: ["shootout", "ps"],
    version: "1.0.0",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: "Interactive Penalty Game with Reply Challenge & Deprecation Fix",
    category: "game",
    guide: {
      en: "{p}penalty <bet> [1/2/3]\n{p}penalty challenge <bet> [@mention / Reply to message]\n{p}penalty accept <1/2/3>\n{p}penalty top / stats"
    }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  parseBet: function (input, balance) {
    if (!input) return NaN;
    const lower = String(input).toLowerCase().trim();
    if (lower === "all") return Math.min(balance, 69000000000);
    if (lower.endsWith("k")) return parseFloat(lower) * 1000;
    if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
    if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
    return parseInt(lower);
  },

  checkLimit: function (userID) {
    const now = Date.now();
    const FIVE_HOURS = 5 * 60 * 60 * 1000;
    let userData = global.penaltyGames.cooldowns.get(userID);

    if (!userData || (now - userData.startTime > FIVE_HOURS)) {
      userData = { count: 0, startTime: now };
    }

    if (userData.count >= 10) {
      const remainingTime = Math.ceil((FIVE_HOURS - (now - userData.startTime)) / (60 * 1000));
      return { allowed: false, remainingTime };
    }

    return { allowed: true, userData };
  },

  incrementLimit: function (userID, userData) {
    userData.count += 1;
    global.penaltyGames.cooldowns.set(userID, userData);
  },

  downloadFile: async function (url, dest) {
    const response = await axios({ url, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  },

  getName: async function (usersData, userID) {
    if (userID === BOT_USER_ID) return "🤖 ᴅɪ-ᴀʙʟᴏ ʙᴏᴛ";
    try {
      if (usersData && typeof usersData.getName === "function") {
        const name = await usersData.getName(userID);
        if (name) return name;
      }
      return `User_${userID}`;
    } catch (e) {
      return `User_${userID}`;
    }
  },

  setReaction: function (api, messageID, icon) {
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction(icon, messageID, (err) => {}, true);
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID, mentions, threadID, messageID, messageReply } = event;
    const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴠᴀᴜʟᴛ 🏛️";
    const MAX_BET = 69000000000;

    try {
      // Ensure Bot Account setup
      await BankUser.findOneAndUpdate(
        { userID: BOT_USER_ID },
        { $setOnInsert: { balance: 999999999999, goals: 0, saves: 0 } },
        { upsert: true, returnDocument: 'after' }
      );

      const subCommand = (args[0] || "").toLowerCase();

      // 🏆 Leaderboard Command
      if (["top", "stats", "leaderboard", "topscore", "topsave"].includes(subCommand)) {
        const topScorers = await BankUser.find().sort({ goals: -1 }).limit(5);
        const topKeepers = await BankUser.find().sort({ saves: -1 }).limit(5);

        let leaderboardText = `🏆 ───[ ᴘᴇɴᴀʟᴛʏ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ ]─── 🏆\n\n`;
        leaderboardText += `⚽ ᴛᴏᴘ sᴄᴏʀᴇʀs:\n`;
        for (let i = 0; i < topScorers.length; i++) {
          const name = await this.getName(usersData, topScorers[i].userID);
          leaderboardText += `${i + 1}. ${name} ➔ ${topScorers[i].goals || 0} Goals\n`;
        }
        leaderboardText += `\n🧤 ᴛᴏᴘ ɢᴏᴀʟᴋᴇᴇᴘᴇʀs:\n`;
        for (let i = 0; i < topKeepers.length; i++) {
          const name = await this.getName(usersData, topKeepers[i].userID);
          leaderboardText += `${i + 1}. ${name} ➔ ${topKeepers[i].saves || 0} Saves\n`;
        }
        return sendMsg(leaderboardText);
      }

      // Limit Check
      const limitInfo = this.checkLimit(senderID);
      if (!limitInfo.allowed) {
        return sendMsg(`❌ ʟɪᴍɪᴛ ʀᴇᴀᴄʜᴇᴅ!\n⏱️ ʏᴏᴜ ʜᴀᴠᴇ ᴘʟᴀʏᴇᴅ 10/10 ᴛɪᴍᴇs.\n💡 ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ${limitInfo.remainingTime} ᴍɪɴᴜᴛᴇs.`);
      }

      let user = await BankUser.findOne({ userID: senderID });
      if (!user) {
        user = await BankUser.create({ userID: senderID, balance: 1000, goals: 0, saves: 0 });
      }

      // Handle PvP Accept
      if (subCommand === "accept") {
        const challengeKey = Array.from(global.penaltyGames.challenges.keys()).find(key => key.endsWith(`_${senderID}`));
        if (!challengeKey) return sendMsg("❌ ɴᴏ ᴘᴇɴᴅɪɴɢ ᴄʜᴀʟʟᴇɴɢᴇ ғᴏᴜɴᴅ ғᴏʀ ʏᴏᴜ!");

        const diveInput = (args[1] || "").toLowerCase();
        const validDir = ["left", "center", "right", "1", "2", "3"];
        if (!validDir.includes(diveInput)) {
          return sendMsg("❌ ᴘʟᴇᴀsᴇ sᴘᴇᴄɪғʏ ʏᴏᴜʀ ᴅɪᴠᴇ ᴅɪʀᴇᴄᴛɪᴏɴ!\n👉 Example: {p}penalty accept 1 (1=Left, 2=Center, 3=Right)");
        }

        let keeperDive = diveInput;
        if (diveInput === "1") keeperDive = "left";
        if (diveInput === "2") keeperDive = "center";
        if (diveInput === "3") keeperDive = "right";

        const challenge = global.penaltyGames.challenges.get(challengeKey);
        if (user.balance < challenge.bet) {
          return sendMsg(`❌ ʏᴏᴜ ᴅᴏ ɴᴏᴛ ʜᴀᴠᴇ ᴇɴᴏᴜɢʜ ʙᴀʟᴀɴᴄᴇ ($${this.formatMoney(challenge.bet)}) ᴛᴏ ᴀᴄᴄᴇᴘᴛ!`);
        }

        this.setReaction(api, messageID, "⏳");
        global.penaltyGames.challenges.delete(challengeKey);

        const p1ID = challenge.challengerID;
        const p2ID = senderID;
        const bet = challenge.bet;
        const strikerShot = challenge.secretShot;

        const isGoal = strikerShot !== keeperDive;

        if (isGoal) {
          await BankUser.findOneAndUpdate({ userID: p1ID }, { $inc: { balance: bet, goals: 1 } }, { upsert: true, returnDocument: 'after' });
          await BankUser.findOneAndUpdate({ userID: p2ID }, { $inc: { balance: -bet } }, { upsert: true, returnDocument: 'after' });
        } else {
          await BankUser.findOneAndUpdate({ userID: p1ID }, { $inc: { balance: -bet } }, { upsert: true, returnDocument: 'after' });
          await BankUser.findOneAndUpdate({ userID: p2ID }, { $inc: { balance: bet, saves: 1 } }, { upsert: true, returnDocument: 'after' });
        }

        this.incrementLimit(p1ID, this.checkLimit(p1ID).userData);
        this.incrementLimit(p2ID, limitInfo.userData);

        const p1Name = await this.getName(usersData, p1ID);
        const p2Name = await this.getName(usersData, p2ID);

        const videoUrl = isGoal ? VIDEOS.goal[strikerShot] : VIDEOS.save[strikerShot];
        const videoPath = path.join(__dirname, `pvp_vid_${Date.now()}.mp4`);

        try {
          await this.downloadFile(videoUrl, videoPath);

          const resultMsg = isGoal
            ? `⚽ ───[ ᴘᴠᴘ ɢᴏᴀʟ ]─── ⚽\n\n` +
              `🔥 ${p1Name} (Striker) shot [${strikerShot.toUpperCase()}] & scored against ${p2Name} [${keeperDive.toUpperCase()}]!\n\n` +
              `🏆 ᴡɪɴɴᴇʀ: ${p1Name} (+$${this.formatMoney(bet)})\n` +
              `💀 ʟᴏsᴇʀ : ${p2Name} (-$${this.formatMoney(bet)})\n` +
              `🏦 ʙᴀɴᴋ   : ${BANK_NAME}`
            : `🧱 ───[ ᴘᴠᴘ sᴀᴠᴇᴅ ]─── ⚽\n\n` +
              `🧤 ${p2Name} (Goalkeeper) dived [${keeperDive.toUpperCase()}] & saved ${p1Name}'s shot [${strikerShot.toUpperCase()}]!\n\n` +
              `🏆 ᴡɪɴɴᴇʀ: ${p2Name} (+$${this.formatMoney(bet)})\n` +
              `💀 ʟᴏsᴇʀ : ${p1Name} (-$${this.formatMoney(bet)})\n` +
              `🏦 ʙᴀɴᴋ   : ${BANK_NAME}`;

          this.setReaction(api, messageID, isGoal ? "⚽" : "🧤");

          return api.sendMessage({
            body: resultMsg,
            attachment: fs.createReadStream(videoPath),
            mentions: [
              { tag: p1Name, id: p1ID },
              { tag: p2Name, id: p2ID }
            ]
          }, threadID, () => {
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
          }, messageID);
        } catch (err) {
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
          return sendMsg("❌ ᴇʀʀᴏʀ ᴘʀᴏᴄᴇssɪɴɢ ᴘᴠᴘ ᴠɪᴅᴇᴏ!");
        }
      }

      // Handle PvP Challenge Creation (Supports Mention & Reply)
      if (subCommand === "challenge") {
        let targetID = null;

        if (mentions && Object.keys(mentions).length > 0) {
          targetID = Object.keys(mentions)[0];
        } else if (messageReply && messageReply.senderID) {
          targetID = messageReply.senderID;
        }

        if (!targetID) {
          return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ ᴛᴏ ᴄʜᴀʟʟᴇɴɢᴇ!\n👉 {p}penalty challenge 10B (by reply or @mention)");
        }

        if (targetID === senderID) return sendMsg("❌ ʏᴏᴜ ᴄᴀɴɴᴏᴛ ᴄʜᴀʟʟᴇɴɢᴇ ʏᴏᴜʀsᴇʟғ!");

        let rawBet = "";
        for (let i = 1; i < args.length; i++) {
          if (!args[i].startsWith("@") && args[i].toLowerCase() !== "challenge") {
            rawBet = args[i];
            break;
          }
        }

        const bet = this.parseBet(rawBet, user.balance);

        if (isNaN(bet) || bet <= 0) {
          return sendMsg(`❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ! ᴘʟᴇᴀsᴇ sᴘᴇᴄɪғʏ ᴀ ᴠᴀʟɪᴅ ᴀᴍᴏᴜɴᴛ.\n👉 {p}penalty challenge 10B`);
        }
        if (bet > MAX_BET) {
          return sendMsg(`❌ ᴍᴀxɪᴍᴜᴍ ʙᴇᴛ ʟɪᴍɪᴛ ɪs $${this.formatMoney(MAX_BET)} ($69B)!`);
        }
        if (user.balance < bet) {
          return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs! ʏᴏᴜ ʜᴀᴠᴇ $${this.formatMoney(user.balance)}`);
        }

        const directions = ["left", "center", "right"];
        const secretShot = directions[Math.floor(Math.random() * directions.length)];

        const senderName = await this.getName(usersData, senderID);
        const targetName = await this.getName(usersData, targetID);

        global.penaltyGames.challenges.set(`${senderID}_${targetID}`, {
          challengerID: senderID,
          targetID,
          bet,
          secretShot
        });

        this.setReaction(api, messageID, "⚔️");

        return api.sendMessage({
          body: `⚔️ ᴘᴇɴᴀʟᴛʏ ᴄʜᴀʟʟᴇɴɢᴇ ⚔️\n\n👤 ${senderName} ᴄʜᴀʟʟᴇɴɢᴇᴅ ${targetName}\n💰 ʙᴇᴛ ᴀᴍᴏᴜɴᴛ: $${this.formatMoney(bet)}\n\n👉 ${targetName} ᴛʏᴘᴇ:\n{p}penalty accept <1/2/3>\n\n[1] Left ⬅️  [2] Center 🎯  [3] Right ➡️`,
          mentions: [
            { tag: senderName, id: senderID },
            { tag: targetName, id: targetID }
          ]
        }, threadID);
      }

      // Single Player PvE
      const bet = this.parseBet(args[0], user.balance);
      const dirInput = (args[1] || "").toLowerCase();
      const validDir = ["left", "center", "right", "1", "2", "3"];

      if (isNaN(bet) || bet <= 0) return sendMsg("❌ ᴜsᴀɢᴇ: {p}penalty <bet/69b> [1/2/3]");
      if (bet > MAX_BET) return sendMsg(`❌ ᴍᴀxɪᴍᴜᴍ ʙᴇᴛ ʟɪᴍɪᴛ ɪs $${this.formatMoney(MAX_BET)} ($69B)!`);
      if (user.balance < bet) return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs!`);

      if (validDir.includes(dirInput)) {
        let playerDir = dirInput;
        if (dirInput === "1") playerDir = "left";
        if (dirInput === "2") playerDir = "center";
        if (dirInput === "3") playerDir = "right";

        return this.playPvEGame({ api, event, senderID, user, bet, playerDir, limitInfo, BANK_NAME });
      }

      const promptText = `⚽ ───[ ᴘᴇɴᴀʟᴛʏ sʜᴏᴏᴛᴏᴜᴛ ]─── ⚽\n\n` +
        `💰 ʙᴇᴛ ᴀᴍᴏᴜɴᴛ : $${this.formatMoney(bet)}\n\n` +
        `🎯 Choose your shooting direction:\n` +
        `[1] Left ⬅️\n[2] Center 🎯\n[3] Right ➡️\n\n` +
        `💡 ʀᴇᴘʟʏ ᴡɪᴛʜ 1, 2, ᴏʀ 3!`;

      const res = await sendMsg(promptText);

      if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(res.messageID, {
          commandName: this.config.name,
          messageID: res.messageID,
          author: senderID,
          bet: bet,
          user: user,
          limitInfo: limitInfo,
          BANK_NAME: BANK_NAME
        });
      }

    } catch (err) {
      console.error("Penalty Game Error:", err);
      return sendMsg("❌ ᴘᴇɴᴀʟᴛʏ ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  },

  onReply: async function ({ api, event, message, Reply }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID, body } = event;

    if (!Reply) return;
    if (Reply.author !== senderID) return sendMsg("❌ ᴛʜɪs ɪs ɴᴏᴛ ʏᴏᴜʀ ɢᴀᴍᴇ!");

    const choice = (body || "").trim();
    const dirMap = { "1": "left", "2": "center", "3": "right", "left": "left", "center": "center", "right": "right" };

    if (!dirMap[choice.toLowerCase()]) {
      return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ! ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ 1, 2, ᴏʀ 3.");
    }

    if (global.GoatBot && global.GoatBot.onReply) {
      global.GoatBot.onReply.delete(Reply.messageID);
    }

    return this.playPvEGame({
      api,
      event,
      senderID,
      user: Reply.user,
      bet: Reply.bet,
      playerDir: dirMap[choice.toLowerCase()],
      limitInfo: Reply.limitInfo,
      BANK_NAME: Reply.BANK_NAME
    });
  },

  playPvEGame: async function ({ api, event, senderID, user, bet, playerDir, limitInfo, BANK_NAME }) {
    const sendMsg = (txt) => api.sendMessage(txt, event.threadID, event.messageID);
    let videoPath = "";

    try {
      this.setReaction(api, event.messageID, "⏳");

      const directions = ["left", "center", "right"];
      const botDir = directions[Math.floor(Math.random() * directions.length)];
      const isGoal = playerDir !== botDir;

      let updatedUser;

      if (isGoal) {
        updatedUser = await BankUser.findOneAndUpdate(
          { userID: senderID },
          { $inc: { balance: bet, goals: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
      } else {
        updatedUser = await BankUser.findOneAndUpdate(
          { userID: senderID },
          { $inc: { balance: -bet } },
          { upsert: true, returnDocument: 'after' }
        );

        await BankUser.findOneAndUpdate(
          { userID: BOT_USER_ID },
          { $inc: { saves: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
      }

      const currentBalance = updatedUser ? updatedUser.balance : user.balance;

      this.incrementLimit(senderID, limitInfo.userData);

      const videoUrl = isGoal ? VIDEOS.goal[playerDir] : VIDEOS.save[playerDir];
      videoPath = path.join(__dirname, `vid_${senderID}_${Date.now()}.mp4`);
      await this.downloadFile(videoUrl, videoPath);

      const msgText = isGoal
        ? `✨ ───[ ᴘᴇɴᴀʟᴛʏ ɢᴏᴀʟ ]─── ✨\n\n` +
          `⚽ ʏᴏᴜ sᴄᴏʀᴇᴅ  : ${playerDir.toUpperCase()}\n` +
          `🧤 ʙᴏᴛ ᴅɪᴠᴇᴅ   : ${botDir.toUpperCase()}\n` +
          `💰 ᴘʀᴏғɪᴛ      : +$${this.formatMoney(bet)}\n` +
          `💳 ʙᴀʟᴀɴᴄᴇ     : $${currentBalance.toLocaleString()}\n` +
          `🏦 ʙᴀɴᴋ        : ${BANK_NAME}`
        : `✨ ───[ ᴘᴇɴᴀʟᴛʏ sᴀᴠᴇᴅ ]─── ✨\n\n` +
          `⚽ ʏᴏᴜ sʜᴏᴛ    : ${playerDir.toUpperCase()}\n` +
          `🧤 ʙᴏᴛ sᴀᴠᴇᴅ   : ${botDir.toUpperCase()}\n` +
          `💸 ʟᴏss        : -$${this.formatMoney(bet)}\n` +
          `💳 ʙᴀʟᴀɴᴄᴇ     : $${currentBalance.toLocaleString()}\n` +
          `🏦 ʙᴀɴᴋ        : ${BANK_NAME}`;

      this.setReaction(api, event.messageID, isGoal ? "⚽" : "🧤");

      const videoStream = fs.existsSync(videoPath) ? fs.createReadStream(videoPath) : null;
      return api.sendMessage({ body: msgText, attachment: videoStream }, event.threadID, () => {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }, event.messageID);

    } catch (err) {
      console.error("PvE Game Error:", err);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      return sendMsg("❌ ᴇʀʀᴏʀ ᴘʀᴏᴄᴇssɪɴɢ ʏᴏᴜʀ ɢᴀᴍᴇ!");
    }
  }
};
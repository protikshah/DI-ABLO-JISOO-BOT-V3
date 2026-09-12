const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Schema Definition with full fields
const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  slotCount: { type: Number, default: 0 },
  slotResetTime: { type: Number, default: 0 }
});

let BankUser;
if (mongoose.models.DiabloBankUser) {
  BankUser = mongoose.models.DiabloBankUser;
  // Dynamic field injection to avoid old schema cache bug
  BankUser.schema.add({
    slotCount: { type: Number, default: 0 },
    slotResetTime: { type: Number, default: 0 }
  });
} else {
  BankUser = mongoose.model("DiabloBankUser", bankUserSchema);
}

const MAX_BET = 69000000000;
const MAX_PLAY_LIMIT = 15;
const COOLDOWN_TIME_MS = 3 * 60 * 60 * 1000; // 3 Hours

const SLOT_VIDEO_URL = "https://files.catbox.moe/3vo6pq.mp4";
const SYMBOLS = ["7️⃣", "🍒", "🔔", "🎰", "💎", "BAR"];

module.exports = {
  config: {
    name: "vipslot",
    aliases: ["vs", "vips", "slotvip"],
    version: "1.0.1",
    author: "Protik Shah",
    countDown: 10,
    role: 0,
    shortDescription: "Play Animated VIP Slot Machine & Win Bank Money",
    category: "games",
    guide: { en: "{p}vipslot <bet_amount / 1k / 1m / 1b / max>" }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
  },

  parseBetAmount: function (input, userBalance) {
    if (!input) return null;
    const str = input.toString().trim().toLowerCase();

    if (str === "all" || str === "max") return userBalance;

    const match = str.match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/);
    if (!match) return null;

    let value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === "k") value *= 1000;
    else if (unit === "m") value *= 1000000;
    else if (unit === "b") value *= 1000000000;

    return Math.floor(value);
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;
    const now = Date.now();

    const rawBet = args[0];
    if (!rawBet) {
      return sendMsg("⚠️ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗘𝗡𝗧𝗘𝗥 𝗔 𝗕𝗘𝗧 𝗔𝗠𝗢𝗨𝗡𝗧!\n👉 𝗨𝘀𝗮𝗴𝗲: !𝘃𝗶𝗽𝘀𝗹𝗼𝘁 <𝗮𝗺𝗼𝘂𝗻𝘁>\n👉 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: !𝘃𝗶𝗽𝘀𝗹𝗼𝘁 𝟭𝗺");
    }

    try {
      let user = await BankUser.findOne({ userID: senderID });
      if (!user) {
        user = await BankUser.create({ userID: senderID, balance: 0, slotCount: 0, slotResetTime: 0 });
      }

      let currentSlotCount = user.slotCount || 0;
      let currentResetTime = user.slotResetTime || 0;

      // Reset Cooldown logic
      if (!currentResetTime || now > currentResetTime) {
        currentSlotCount = 0;
        currentResetTime = now + COOLDOWN_TIME_MS;
        await BankUser.updateOne({ userID: senderID }, { $set: { slotCount: 0, slotResetTime: currentResetTime } });
      }

      if (currentSlotCount >= MAX_PLAY_LIMIT) {
        const remainingMs = currentResetTime - now;
        const remainingMins = Math.ceil(remainingMs / (1000 * 60));
        const hours = Math.floor(remainingMins / 60);
        const mins = remainingMins % 60;
        
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        return sendMsg(`🛑 𝗚𝗔𝗠𝗘 𝗟𝗜𝗠𝗜𝗧 𝗥𝗘𝗔𝗖𝗛𝗘𝗗!\n👉 You have played ${MAX_PLAY_LIMIT}/${MAX_PLAY_LIMIT} times in 3 hours.\n⏳ Please wait ${timeStr} to play again!`);
      }

      const currentBalance = user.balance || 0;
      const betAmount = this.parseBetAmount(rawBet, currentBalance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗕𝗘𝗧 𝗙𝗢𝗥𝗠𝗔𝗧!\n👉 𝗨𝘀𝗲 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗼𝗿 𝘀𝘂𝗳𝗳𝗶𝘅𝗲𝘀 𝗹𝗶𝗸𝗲: 𝟭𝗸, 𝟮.𝟱𝗺, 𝟭𝗯, 𝗺𝗮𝘅");
      }

      if (betAmount > MAX_BET) {
        return sendMsg(`⚠️ 𝗠𝗔𝗫𝗜𝗠𝗨𝗠 𝗕𝗘𝗧 𝗟𝗜𝗠𝗜𝗧 𝗜𝗦 $${this.formatMoney(MAX_BET)} USD!`);
      }

      if (currentBalance < betAmount) {
        return sendMsg(`❌ 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗕𝗔𝗟𝗔𝗡𝗖𝗘!\n💳 𝗬𝗼𝘂𝗿 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $${this.formatMoney(currentBalance)} USD`);
      }

      let userName = senderID;
      if (usersData && typeof usersData.getName === "function") {
        try { userName = await usersData.getName(senderID); } catch (e) {}
      }

      // Increment Count in Database directly
      currentSlotCount += 1;
      await BankUser.updateOne({ userID: senderID }, { $set: { slotCount: currentSlotCount, slotResetTime: currentResetTime } });

      // Step 1: Send VIP Slot Video Animation
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const videoPath = path.join(cacheDir, `slot_${senderID}_${Date.now()}.mp4`);

      let videoMsgInfo = null;

      try {
        const videoRes = await axios({ url: SLOT_VIDEO_URL, responseType: "stream" });
        const writer = fs.createWriteStream(videoPath);
        videoRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        const remainingAttempts = MAX_PLAY_LIMIT - currentSlotCount;
        const videoPayload = {
          body: `🎰 𝗦𝗣𝗜𝗡𝗡𝗜𝗡𝗚 𝗧𝗛𝗘 𝗩𝗜𝗣 𝗦𝗟𝗢𝗧 𝗠𝗔𝗖𝗛𝗜𝗡𝗘...\n👤 Player: ${userName.toUpperCase()}\n💵 Bet: $${this.formatMoney(betAmount)} USD\n🎯 Limit Remaining: ${remainingAttempts}/${MAX_PLAY_LIMIT}`,
          attachment: fs.createReadStream(videoPath)
        };

        videoMsgInfo = await new Promise((resolve) => {
          if (message && typeof message.reply === "function") {
            message.reply(videoPayload, (err, info) => resolve(info || err));
          } else {
            api.sendMessage(videoPayload, event.threadID, (err, info) => resolve(info || err), event.messageID);
          }
        });
      } catch (e) {
        console.log("Slot Video download failed, skipping to canvas result...", e);
      } finally {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }

      // ⏳ Wait 12 Seconds
      await new Promise(res => setTimeout(res, 12000));

      if (videoMsgInfo && videoMsgInfo.messageID) {
        try {
          if (typeof api.unsendMessage === "function") {
            api.unsendMessage(videoMsgInfo.messageID);
          }
        } catch (e) {}
      }

      const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

      let multiplier = 0;
      let resultText = "NO MATCH";

      if (s1 === s2 && s2 === s3) {
        multiplier = 10.0;
        resultText = "TRIPLE JACKPOT! (10X)";
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        multiplier = 2.0;
        resultText = "DOUBLE MATCH! (2X)";
      } else {
        multiplier = 0;
        resultText = "NO MATCH (0X)";
      }

      const winAmount = Math.floor(betAmount * multiplier);
      const netChange = winAmount - betAmount;

      // Atomic Balance Update
      const updatedUser = await BankUser.findOneAndUpdate(
        { userID: senderID },
        { $inc: { balance: netChange } },
        { new: true }
      );

      // Step 2: Render Canvas Result Card
      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0a0512";
      ctx.fillRect(0, 0, 900, 500);

      const themeHex = multiplier === 10 ? "#f59e0b" : multiplier === 2 ? "#3b82f6" : "#ef4444";

      const laserGlows = [
        { color: themeHex, blur: 30, width: 12 },
        { color: "#ffffff", blur: 4, width: 2 }
      ];

      laserGlows.forEach(g => {
        ctx.save();
        ctx.shadowColor = g.color;
        ctx.shadowBlur = g.blur;
        ctx.strokeStyle = g.color;
        ctx.lineWidth = g.width;
        ctx.strokeRect(20, 20, 860, 460);
        ctx.restore();
      });

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 30px 'Segoe UI', Sans-serif";
      ctx.fillText("🎰 VIP SLOT MACHINE RESULT 🎰", 50, 75);

      ctx.fillStyle = netChange >= 0 ? "#4ade80" : "#ef4444";
      ctx.font = "bold 16px 'Segoe UI', Sans-serif";
      ctx.fillText(
        netChange >= 0 
          ? `► CONGRATS! MATCHED SYMBOLS (${resultText})` 
          : `► HARD LUCK! BETTER LUCK NEXT TIME`, 
        52, 105
      );

      try {
        const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=300&width=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarImg = await loadImage(avatarUrl);

        ctx.save();
        ctx.shadowColor = themeHex;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(740, 115, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, 680, 55, 120, 120);
        ctx.restore();

        ctx.strokeStyle = themeHex;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(740, 115, 60, 0, Math.PI * 2); ctx.stroke();
      } catch (e) {}

      ctx.fillStyle = "#1e1b2e";
      ctx.strokeStyle = themeHex;
      ctx.lineWidth = 4;
      ctx.fillRect(200, 160, 500, 150);
      ctx.strokeRect(200, 160, 500, 150);

      ctx.fillStyle = "#ffffff";
      ctx.font = "60px 'Segoe UI', Sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s1, 280, 255);
      ctx.fillText(s2, 450, 255);
      ctx.fillText(s3, 620, 255);
      ctx.textAlign = "left";

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 14px 'Segoe UI', Sans-serif";
      ctx.fillText("PLAYER", 50, 385);
      ctx.fillText("BET AMOUNT", 250, 385);
      ctx.fillText(netChange >= 0 ? "PROFIT" : "LOSS", 430, 385);
      ctx.fillText("NEW BALANCE", 600, 385);
      ctx.fillText("3H LIMIT", 760, 385);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px 'Segoe UI', Sans-serif";
      const shortName = userName.length > 12 ? userName.substring(0, 12) + "..." : userName;
      ctx.fillText(shortName, 50, 415);

      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`$${this.formatMoney(betAmount)}`, 250, 415);

      ctx.fillStyle = netChange >= 0 ? "#4ade80" : "#ef4444";
      ctx.fillText(`${netChange >= 0 ? "+" : "-"}$${this.formatMoney(Math.abs(netChange))}`, 430, 415);

      ctx.fillStyle = "#f1c40f";
      ctx.fillText(`$${this.formatMoney(updatedUser.balance)}`, 600, 415);

      ctx.fillStyle = "#a855f7";
      ctx.fillText(`${currentSlotCount}/${MAX_PLAY_LIMIT}`, 760, 415);

      const cardPath = path.join(cacheDir, `slot_res_${senderID}_${Date.now()}.png`);
      await fs.writeFile(cardPath, canvas.toBuffer("image/png"));

      const finalPayload = {
        body: netChange >= 0
          ? `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦 ${userName.toUpperCase()}!\n🎯 𝗥𝗲𝘀𝘂𝗹𝘁: [ ${s1} | ${s2} | ${s3} ]\n💎 𝗬𝗢𝗨 𝗪𝗢𝗡 $${this.formatMoney(winAmount)} USD!`
          : `💔 𝗕𝗘𝗧𝗧𝗘𝗥 𝗟𝗨𝗖𝗞 𝗡𝗘𝗫𝗧 𝗧𝗜𝗠𝗘 ${userName.toUpperCase()}!\n🎯 𝗥𝗲𝘀𝘂𝗹𝘁: [ ${s1} | ${s2} | ${s3} ]\n📉 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 $${this.formatMoney(betAmount)} USD!`,
        attachment: fs.createReadStream(cardPath)
      };

      const sendCallback = () => { if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath); };
      return message && typeof message.reply === "function" ? message.reply(finalPayload, sendCallback) : api.sendMessage(finalPayload, event.threadID, sendCallback, event.messageID);

    } catch (err) {
      console.error(err);
      return sendMsg("❌ 𝗩𝗜𝗣𝗦𝗟𝗢𝗧 𝗚𝗔𝗠𝗘 𝗘𝗥𝗥𝗢𝗥!");
    }
  }
};

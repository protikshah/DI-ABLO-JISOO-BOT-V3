const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "couple1",
    aliases: ["couple12", "romantic12"],
    version: "1.0.2",
    author: "Pratik Shah",
    role: 0,
    category: "fun",
    cooldown: 5,
    guide: {
      en: "{pn} [mention/reply/UID]",
      bn: "{pn} [মেনশন/রিপ্লাই/UID]"
    }
  },

  langs: {
    bn: {
      noTarget: "• কার সাথে পেয়ার করতে চাও? মেনশন, রিপ্লাই বা UID দাও",
      error: "❌ সমস্যা! %1",
      success: "❤️ What a lovely couple!"
    },
    en: {
      noTarget: "• Mention, reply, or provide UID to pair with",
      error: "❌ Error! %1",
      success: "❤️ What a lovely couple!"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    
    let targetUID = messageReply?.senderID || Object.keys(mentions)[0] || args[0];
    if (!targetUID) {
      return api.sendMessage(getLang("noTarget"), threadID, messageID);
    }

    const BACKGROUND_IMAGE_URL = "https://files.catbox.moe/ps24ap.jpg";

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `couple_${senderID}_${targetUID}_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const targetAvatarUrl = `https://graph.facebook.com/${targetUID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const [bgImg, senderImg, targetImg] = await Promise.all([
        loadImage(BACKGROUND_IMAGE_URL),
        loadImage(senderAvatarUrl),
        loadImage(targetAvatarUrl)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      // Draw Background Image
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height);

      const avatarSize = 105; // ফ্রেমের সাইজ

      // --- Left Profile Pic (Boy Position: 👨) ---
      const x1 = Math.floor(bgImg.width * 0.31) - (avatarSize / 2);
      const y1 = Math.floor(bgImg.height * 0.25) - (avatarSize / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(senderImg, x1, y1, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // --- Right Profile Pic (Girl Position: 👩 - Fixed Position) ---
      const x2 = Math.floor(bgImg.width * 0.78) - (avatarSize / 2);
      const y2 = Math.floor(bgImg.height * 0.28) - (avatarSize / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetImg, x2, y2, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Output & Send
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      api.sendMessage({
        body: getLang("success"),
        attachment: fs.createReadStream(outputPath)
      }, threadID, (err) => {
        if (!err) api.setMessageReaction("❤️", messageID, () => {}, true);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, messageID);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      api.sendMessage(getLang("error", err.message || "Unknown error"), threadID, messageID);
    }
  }
};
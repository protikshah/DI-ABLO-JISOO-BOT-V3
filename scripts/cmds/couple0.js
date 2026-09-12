const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "couple0",
    aliases: ["couple11mm", "romantic11nn"],
    version: "1.0.0",
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
      success: "❤️ তোমাদের জুটিটা দেখতে একদম দুর্দান্ত লাগছে!"
    },
    en: {
      noTarget: "• Mention, reply, or provide UID to pair with",
      error: "❌ Error! %1",
      success: "❤️ What a lovely couple!"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    
    // Target User ID Determination
    let targetUID = messageReply?.senderID || Object.keys(mentions)[0] || args[0];
    if (!targetUID) {
      return api.sendMessage(getLang("noTarget"), threadID, messageID);
    }

    // Background Image URL (Catbox Image)
    const BACKGROUND_IMAGE_URL = "https://files.catbox.moe/ps24ap.jpg"; // তুই চাইলে নিজের ইমেজ Catbox এ আপলোড করে URL বসিয়ে দিতে পারিস

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `pair_${senderID}_${targetUID}_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      // FB Profile Pictures API
      const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const targetAvatarUrl = `https://graph.facebook.com/${targetUID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Load Images
      const [bgImg, senderImg, targetImg] = await Promise.all([
        loadImage("https://files.catbox.moe/ugkyy9.jpg"), // তোর ব্যাকগ্রাউন্ড বা ফ্রেম ফটো
        loadImage(senderAvatarUrl),
        loadImage(targetAvatarUrl)
      ]);

      // Canvas Setup
      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      // Draw Background
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height);

      const avatarSize = 100; // সাইজ অ্যাডজাস্ট করতে পারিস

      // --- Draw Sender Avatar (Left Side) ---
      const x1 = 60;
      const y1 = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(senderImg, x1, y1, avatarSize, avatarSize);
      ctx.restore();

      // Border for Sender
      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // --- Draw Target Avatar (Right Side) ---
      const x2 = bgImg.width - avatarSize - 60;
      const y2 = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetImg, x2, y2, avatarSize, avatarSize);
      ctx.restore();

      // Border for Target
      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Save Buffer
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      // Send Response
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
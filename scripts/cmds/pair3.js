const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    author: "Pratik Shah",
    category: "love",
    version: "1.0.1",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `pair3_${event.senderID}_${Date.now()}.png`);

    // Helper to download image safely
    async function getImageBuffer(url) {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        return await loadImage(Buffer.from(response.data));
      } catch (e) {
        return null;
      }
    }

    // Safe Profile Picture Loader
    async function fetchAvatar(uid) {
      const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const encodedToken = encodeURIComponent(token);
      
      const urls = [
        `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=${encodedToken}`,
        `https://graph.facebook.com/${uid}/picture?type=large`
      ];

      for (const u of urls) {
        const img = await getImageBuffer(u);
        if (img) return img;
      }
      return await loadImage("https://files.catbox.moe/zgic18.jpg");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      let threadData;
      try {
        threadData = await api.getThreadInfo(event.threadID);
      } catch (e) {
        threadData = { participantIDs: [] };
      }
      
      // Get all participant IDs
      const participantIDs = threadData.participantIDs || threadData.userInfo?.map(u => u.id) || [];
      const senderID = event.senderID;

      const mentions = event.mentions || {};
      const mentionIDs = Object.keys(mentions);
      const repliedUserID = event.type === "message_reply" ? event.messageReply.senderID : null;

      let user1ID = senderID;
      let user2ID = null;

      if (mentionIDs.length >= 2) {
        const filtered = mentionIDs.filter(id => id !== senderID);
        if (filtered.length >= 2) {
          user1ID = filtered[0];
          user2ID = filtered[1];
        } else if (filtered.length === 1) {
          user1ID = senderID;
          user2ID = filtered[0];
        }
      } else if (mentionIDs.length === 1 && mentionIDs[0] !== senderID) {
        user1ID = senderID;
        user2ID = mentionIDs[0];
      } else if (repliedUserID && repliedUserID !== senderID) {
        user1ID = senderID;
        user2ID = repliedUserID;
      }

      // If no valid mention or reply, pick a RANDOM participant excluding sender
      if (!user2ID) {
        const otherMembers = participantIDs.filter(id => id !== senderID);
        if (otherMembers.length === 0) {
          return api.sendMessage("⚠️ গ্রুপে অন্য কোনো মেম্বার পাওয়া যায়নি!", event.threadID, event.messageID);
        }
        user2ID = otherMembers[Math.floor(Math.random() * otherMembers.length)];
      }

      // 1. Background Image Load
      const bgUrl = "https://files.catbox.moe/zgic18.jpg";
      let background = await getImageBuffer(bgUrl);

      if (!background) {
        return api.sendMessage("❌ ব্যাকগ্রাউন্ড ইমেজ লোড হতে সমস্যা হয়েছে!", event.threadID, event.messageID);
      }

      // 2. Fetch User Avatars
      const [img1, img2] = await Promise.all([
        fetchAvatar(user1ID),
        fetchAvatar(user2ID)
      ]);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw Background
      ctx.drawImage(background, 0, 0, background.width, background.height);

      // Helper function for circular avatar with stroke
      function drawCircleAvatar(img, x, y, size, strokeColor = "#FF1493") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ---------------- Avatar Positions ----------------

      // 1. Male / Standing Character (উপরে ডানে)
      const size1 = 115;
      const x1 = Math.floor(background.width * 0.52) - (size1 / 2);
      const y1 = Math.floor(background.height * 0.11) - (size1 / 2);
      drawCircleAvatar(img1, x1, y1, size1, "#1E90FF"); // Blue border

      // 2. Female / Seated Character (বামে চেয়ারে বাঁধা)
      const size2 = 110;
      const x2 = Math.floor(background.width * 0.41) - (size2 / 2);
      const y2 = Math.floor(background.height * 0.30) - (size2 / 2);
      drawCircleAvatar(img2, x2, y2, size2, "#FF1493"); // Pink border

      // Save Output Image
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      // Send response without body text
      api.sendMessage(
        {
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        (err) => {
          if (!err) api.setMessageReaction("❤️", event.messageID, () => {}, true);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        },
        event.messageID
      );

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      api.sendMessage(
        "❌ An error occurred:\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
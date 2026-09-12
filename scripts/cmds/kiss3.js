const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "kiss3",
    author: "Pratik Shah",
    category: "love",
    version: "1.0.2",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `kiss3_${event.senderID}_${Date.now()}.png`);

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
      return await loadImage("https://i.imgur.com/2bf3yA5.png");
    }

    try {
      api.setMessageReaction("💋", event.messageID, () => {}, true);

      let threadData;
      try {
        threadData = await api.getThreadInfo(event.threadID);
      } catch (e) {
        threadData = { participantIDs: [] };
      }
      
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

      // Mention বা Reply না থাকলে Random Member ধরবে
      if (!user2ID) {
        const otherMembers = participantIDs.filter(id => id !== senderID);
        if (otherMembers.length === 0) {
          return api.sendMessage("⚠️ গ্রুপে অন্য কোনো মেম্বার পাওয়া যায়নি!", event.threadID, event.messageID);
        }
        user2ID = otherMembers[Math.floor(Math.random() * otherMembers.length)];
      }

      // 1. Background Image Load
      const bgUrl = "https://files.catbox.moe/zabz0x.jpg";
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

      // Helper function for circular avatar WITHOUT outer border/stroke
      function drawCircleAvatarNoBorder(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // ---------------- Avatar Positions ----------------

      // 1. Male Character (ছেলের মাথা বরাবর - বামে)
      const size1 = 200; // সাইজ বড় করা হয়েছে
      const x1 = Math.floor(background.width * 0.33) - (size1 / 2);
      const y1 = Math.floor(background.height * 0.17) - (size1 / 2);
      drawCircleAvatarNoBorder(img1, x1, y1, size1);

      // 2. Female Character (মেয়ের মাথা বরাবর - ডানে শিফট করা হয়েছে)
      const size2 = 200; // সাইজ বড় করা হয়েছে
      const x2 = Math.floor(background.width * 0.76) - (size2 / 2);
      const y2 = Math.floor(background.height * 0.32) - (size2 / 2);
      drawCircleAvatarNoBorder(img2, x2, y2, size2);

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
          if (!err) api.setMessageReaction("💋", event.messageID, () => {}, true);
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
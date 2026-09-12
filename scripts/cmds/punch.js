const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "punch1",
    author: "Protik Shah",
    category: "fun",
    version: "1.0.0",
    cooldown: 5
  },

  onStart: async function ({ api, event, usersData }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `punch_${event.senderID}_${Date.now()}.png`);

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
      return await loadImage("https://files.catbox.moe/zmhpnq.jpg");
    }

    try {
      api.setMessageReaction("👊", event.messageID, () => {}, true);

      let threadData;
      try {
        threadData = await api.getThreadInfo(event.threadID);
      } catch (e) {
        threadData = { userInfo: [] };
      }
      
      const users = threadData.userInfo || [];
      const senderID = event.senderID;

      const mentions = event.mentions || {};
      const mentionIDs = Object.keys(mentions);
      const repliedUserID = event.type === "message_reply" ? event.messageReply.senderID : null;

      let targetID = null;

      if (mentionIDs.length > 0 && mentionIDs[0] !== senderID) {
        targetID = mentionIDs[0];
      } else if (repliedUserID && repliedUserID !== senderID) {
        targetID = repliedUserID;
      } else {
        // Random target if no mention/reply
        const otherUsers = users.filter(u => u.id !== senderID);
        if (otherUsers.length > 0) {
          const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
          targetID = randomUser.id;
        } else {
          return api.sendMessage("⚠️ গ্রুপে ঘুষি মারার মতো অন্য কোনো মেম্বার পাওয়া যায়নি!", event.threadID, event.messageID);
        }
      }

      let senderName = "You";
      let targetName = "Target";

      // Fetch Names
      try {
        if (usersData && usersData.get) {
          const s = await usersData.get(senderID);
          const t = await usersData.get(targetID);
          if (s && s.name) senderName = s.name;
          if (t && t.name) targetName = t.name;
        }
      } catch (e) {}

      const sObj = users.find(u => u.id === senderID);
      const tObj = users.find(u => u.id === targetID);
      if (sObj && sObj.name) senderName = sObj.name;
      if (tObj && tObj.name) targetName = tObj.name;

      // 1. Background Image Load
      const bgUrl = "https://i.ibb.co/3s3f5Lp/punch-bg.jpg"; // Backup load handler
      let background = await getImageBuffer("https://files.catbox.moe/zmhpnq.jpg");

      if (!background) {
        background = await getImageBuffer(bgUrl);
      }

      if (!background) {
        return api.sendMessage("❌ ব্যাকগ্রাউন্ড ইমেজ লোড হতে সমস্যা হয়েছে!", event.threadID, event.messageID);
      }

      // 2. Fetch Avatars
      const [imgPuncher, imgTarget] = await Promise.all([
        fetchAvatar(senderID),
        fetchAvatar(targetID)
      ]);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw Background
      ctx.drawImage(background, 0, 0, background.width, background.height);

      // Helper function for circular avatar
      function drawCircleAvatar(img, x, y, size, strokeColor = "#FF0000") {
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
      
      // 1. Puncher Guy (বাম পাশের ক্যারেক্টার - যে ঘুষি মারছে)
      const size1 = 110;
      const x1 = Math.floor(background.width * 0.38) - (size1 / 2);
      const y1 = Math.floor(background.height * 0.30) - (size1 / 2);
      drawCircleAvatar(imgPuncher, x1, y1, size1, "#FF4500"); // Red-Orange border

      // 2. Punched Guy (ডান পাশের ক্যারেক্টার - যে ঘুষি খাচ্ছে)
      const size2 = 120;
      const x2 = Math.floor(background.width * 0.82) - (size2 / 2);
      const y2 = Math.floor(background.height * 0.52) - (size2 / 2);
      drawCircleAvatar(imgTarget, x2, y2, size2, "#1E90FF"); // Blue border

      // Save Output
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      const damage = Math.floor(Math.random() * 600) + 400;

      api.sendMessage(
        {
          body: `🥊 SUPER UPPERCUT 🥊\n\n💥 ${senderName} এর বিষাক্ত আপারকাট ঘুষিতে ${targetName} আকাশে উড়ি গেল! 😵\n\n🔥 Damage: -${damage} HP!`,
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        (err) => {
          if (!err) api.setMessageReaction("💥", event.messageID, () => {}, true);
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
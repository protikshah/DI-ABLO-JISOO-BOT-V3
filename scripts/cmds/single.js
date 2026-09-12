const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "single",
    author: "Pratik Shah",
    category: "fun",
    version: "1.0.2",
    cooldown: 5
  },

  onStart: async function ({ api, event, usersData }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `single_${event.senderID}_${Date.now()}.png`);

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
      api.setMessageReaction("🪓", event.messageID, () => {}, true);

      let threadData;
      try {
        threadData = await api.getThreadInfo(event.threadID);
      } catch (e) {
        threadData = { userInfo: [] };
      }
      
      const users = threadData.userInfo || [];
      const senderID = event.senderID;

      // Filter members for couple (excluding the command sender)
      const otherUsers = users.filter(u => u.id !== senderID);

      if (otherUsers.length < 2) {
        return api.sendMessage("⚠️ গ্রুপে অন্তত ৩ জন মেম্বার থাকতে হবে এই কমান্ড কাজ করার জন্য!", event.threadID, event.messageID);
      }

      // Randomly select Male & Female candidates
      const males = otherUsers.filter(u => u.gender === "MALE");
      const females = otherUsers.filter(u => u.gender === "FEMALE");

      let maleMatch, femaleMatch;

      // Select Male (Random)
      if (males.length > 0) {
        maleMatch = males[Math.floor(Math.random() * males.length)];
      } else {
        maleMatch = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      }

      // Select Female (Random & not the same male)
      const remainingForFemale = females.filter(u => u.id !== maleMatch.id);
      if (remainingForFemale.length > 0) {
        femaleMatch = remainingForFemale[Math.floor(Math.random() * remainingForFemale.length)];
      } else {
        const remainingAll = otherUsers.filter(u => u.id !== maleMatch.id);
        femaleMatch = remainingAll[Math.floor(Math.random() * remainingAll.length)];
      }

      let senderName = "You";
      let kissBoyName = maleMatch.name || "Boy";
      let kissGirlName = femaleMatch.name || "Girl";

      try {
        if (usersData && usersData.get) {
          const s = await usersData.get(senderID);
          if (s && s.name) senderName = s.name;
        }
      } catch (e) {}

      // 1. Background Image Load
      const bgUrl = "https://files.catbox.moe/8bjqdb.jpg";
      let background = await getImageBuffer(bgUrl);

      if (!background) {
        return api.sendMessage("❌ ব্যাকগ্রাউন্ড ইমেজ লোড হতে সমস্যা হয়েছে!", event.threadID, event.messageID);
      }

      // 2. Fetch Avatars
      const [imgAxeUser, imgKissBoy, imgKissGirl] = await Promise.all([
        fetchAvatar(senderID),       // কুড়াল ওয়ালা (ইউজার)
        fetchAvatar(maleMatch.id),   // কিস করা ছেলে
        fetchAvatar(femaleMatch.id)  // কিস করা মেয়ে
      ]);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw Background
      ctx.drawImage(background, 0, 0, background.width, background.height);

      // Helper function for circular avatar with stroke
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
      
      // 1. Axe Guy (পিছনে কুড়াল ওয়ালা - Command Sender)
      const size1 = 80;
      const x1 = Math.floor(background.width * 0.43) - (size1 / 2);
      const y1 = Math.floor(background.height * 0.28) - (size1 / 2);
      drawCircleAvatar(imgAxeUser, x1, y1, size1, "#FF0000"); // Red border

      // 2. Kissing Boy (সামনে বামে - Male Couple)
      const size2 = 90;
      const x2 = Math.floor(background.width * 0.62) - (size2 / 2);
      const y2 = Math.floor(background.height * 0.30) - (size2 / 2);
      drawCircleAvatar(imgKissBoy, x2, y2, size2, "#1E90FF"); // Blue border

      // 3. Kissing Girl (সামনে ডানে - Female Couple)
      const size3 = 90;
      const x3 = Math.floor(background.width * 0.80) - (size3 / 2);
      const y3 = Math.floor(background.height * 0.30) - (size3 / 2);
      drawCircleAvatar(imgKissGirl, x3, y3, size3, "#FF1493"); // Pink border

      // Save Output
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      api.sendMessage(
        {
          body: `🪓 সিঙ্গেলদের অভিশাপ!\n\n😡 কুড়াল হাতে: ${senderName}\n💋 প্রেমিক-প্রেমিকা: ${kissBoyName} 💖 ${kissGirlName}\n\n"তোর প্রেম আমি কুড়াল দিয়ে কাইটা দিমু!" 😈`,
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        (err) => {
          if (!err) api.setMessageReaction("😂", event.messageID, () => {}, true);
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
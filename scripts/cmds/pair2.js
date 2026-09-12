const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    author: "Pratik Shah",
    category: "love",
    version: "2.0.4",
    cooldown: 5
  },

  onStart: async function ({ api, event, usersData }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `pair2_${event.senderID}_${Date.now()}.png`);

    // Helper to download image buffer safely without 404 crash
    async function getImageBuffer(url) {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        return await loadImage(Buffer.from(response.data));
      } catch (e) {
        return null;
      }
    }

    // Helper to fetch user avatar
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
      // Fallback Avatar
      return await loadImage("https://i.imgur.com/2bf3yA5.png");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      let threadData;
      try {
        threadData = await api.getThreadInfo(event.threadID);
      } catch (e) {
        threadData = { userInfo: [] };
      }
      
      const users = threadData.userInfo || [];

      const mentions = event.mentions || {};
      const mentionIDs = Object.keys(mentions);
      const repliedUserID = event.type === "message_reply" ? event.messageReply.senderID : null;
      const senderID = event.senderID;

      let user1ID = null;
      let user2ID = null;

      if (mentionIDs.length >= 2) {
        const filtered = mentionIDs.filter(id => id !== senderID);
        if (filtered.length < 2) {
          return api.sendMessage("⚠️ Please mention two different users (not yourself).", event.threadID, event.messageID);
        }
        user1ID = filtered[0];
        user2ID = filtered[1];
      } else if (mentionIDs.length === 1 && mentionIDs[0] !== senderID) {
        user1ID = senderID;
        user2ID = mentionIDs[0];
      } else if (repliedUserID && repliedUserID !== senderID) {
        user1ID = senderID;
        user2ID = repliedUserID;
      }

      let selectedMatchID, senderName = "User 1", matchName = "User 2";

      if (user1ID && user2ID) {
        selectedMatchID = user2ID;
        try {
          if (usersData && usersData.get) {
            const u1 = await usersData.get(user1ID);
            const u2 = await usersData.get(user2ID);
            if (u1 && u1.name) senderName = u1.name;
            if (u2 && u2.name) matchName = u2.name;
          }
        } catch (e) {}

        const u1Obj = users.find(u => u.id === user1ID);
        const u2Obj = users.find(u => u.id === user2ID);
        if (u1Obj && u1Obj.name) senderName = u1Obj.name;
        if (u2Obj && u2Obj.name) matchName = u2Obj.name;

      } else {
        const senderData = users.find((u) => u.id === senderID);
        const myGender = senderData?.gender;

        let matchCandidates = [];
        if (myGender === "MALE") {
          matchCandidates = users.filter(u => u.gender === "FEMALE" && u.id !== senderID);
        } else if (myGender === "FEMALE") {
          matchCandidates = users.filter(u => u.gender === "MALE" && u.id !== senderID);
        } else {
          matchCandidates = users.filter(u => u.id !== senderID);
        }

        if (matchCandidates.length === 0) {
          matchCandidates = users.filter(u => u.id !== senderID);
        }

        if (matchCandidates.length === 0) {
          return api.sendMessage("❌ No suitable match found in the group.", event.threadID, event.messageID);
        }

        const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
        selectedMatchID = selectedMatch.id;
        matchName = selectedMatch.name || "Match";

        user1ID = senderID;
        try {
          if (usersData && usersData.get) {
            const u1 = await usersData.get(senderID);
            if (u1 && u1.name) senderName = u1.name;
          }
        } catch (e) {}
        if (senderData && senderData.name) senderName = senderData.name;
      }

      // 1. Download Background Image safely with multiple backups
      const bgUrls = [
        "https://files.catbox.moe/gly1xj.jpg",
        "https://files.catbox.moe/gly1xj.jpg"
      ];

      let background = null;
      for (const bgUrl of bgUrls) {
        background = await getImageBuffer(bgUrl);
        if (background) break;
      }

      if (!background) {
        return api.sendMessage("❌ Background image server is temporarily down. Please try again later.", event.threadID, event.messageID);
      }

      // 2. Fetch User Avatars
      const [img1, img2] = await Promise.all([
        fetchAvatar(user1ID),
        fetchAvatar(selectedMatchID)
      ]);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw Background
      ctx.drawImage(background, 0, 0, background.width, background.height);

      const avatarSize = 135; // Circle Size

      // --- Left Avatar Position (👨/👩) ---
      const x1 = Math.floor(background.width * 0.42) - (avatarSize / 2);
      const y1 = Math.floor(background.height * 0.32) - (avatarSize / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img1, x1, y1, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x1 + avatarSize / 2, y1 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // --- Right Avatar Position (👩/👨) ---
      const x2 = Math.floor(background.width * 0.66) - (avatarSize / 2);
      const y2 = Math.floor(background.height * 0.42) - (avatarSize / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img2, x2, y2, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#FF1493";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x2 + avatarSize / 2, y2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Save Output Image
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      const lovePercent = Math.floor(Math.random() * 30) + 70;

      api.sendMessage(
        {
          body: `🎉 𝗣𝗮𝗶𝗿 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹!\n👨 ${senderName}\n👩 ${matchName}\n💘 𝗟𝗼𝘃𝗲 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}% 💙\n💌 Wish you two endless happiness!`,
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
        "❌ An error occurred while trying to find a match.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
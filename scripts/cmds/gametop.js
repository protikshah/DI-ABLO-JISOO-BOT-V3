const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const MinerUser = mongoose.model("DiabloMinerUser");
const FisherUser = mongoose.model("DiabloFisherUser");
const AdventureUser = mongoose.model("DiabloAdventureUser");

module.exports = {
  config: {
    name: "gametop",
    aliases: ["gtop", "alltop"],
    version: "2.0.0",
    author: "protik shah",
    countDown: 5,
    role: 0,
    shortDescription: "top 10 players by total level & balance",
    category: "game",
    guide: { en: "{p}gametop" }
  },

  formatMoney: (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  },

  onStart: async function ({ api, event, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;

    try {
      const [miners, fishers, advs] = await Promise.all([
        MinerUser.find({}),
        FisherUser.find({}),
        AdventureUser.find({})
      ]);

      const userMap = {};

      // Merge all users
      const allUsers = {};

      miners.forEach(u => {
        const id = u.userID;
        if (!allUsers[id]) allUsers[id] = { mining: u, fishing: null, adventure: null, userName: u.userName || id };
        else allUsers[id].mining = u;
        if (u.userName) allUsers[id].userName = u.userName;
      });

      fishers.forEach(u => {
        const id = u.userID;
        if (!allUsers[id]) allUsers[id] = { mining: null, fishing: u, adventure: null, userName: u.userName || id };
        else allUsers[id].fishing = u;
        if (u.userName) allUsers[id].userName = u.userName;
      });

      advs.forEach(u => {
        const id = u.userID;
        if (!allUsers[id]) allUsers[id] = { mining: null, fishing: null, adventure: u, userName: u.userName || id };
        else allUsers[id].adventure = u;
        if (u.userName) allUsers[id].userName = u.userName;
      });

      const sorted = Object.values(allUsers)
        .map(u => {
          const mining = u.mining || {};
          const fishing = u.fishing || {};
          const adventure = u.adventure || {};
          const totalLevel = (mining.level || 1) + (fishing.level || 1) + (adventure.level || 1);
          const totalBalance = (mining.balance || 0) + (fishing.balance || 0) + (adventure.balance || 0);
          return { ...u, totalLevel, totalBalance, mining, fishing, adventure };
        })
        .sort((a, b) => b.totalLevel - a.totalLevel || b.totalBalance - a.totalBalance)
        .slice(0, 10);

      if (sorted.length === 0) return sendMsg("❌ No data found.");

      const canvasHeight = 160 + (sorted.length * 100);
      const canvas = createCanvas(1050, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0b1215";
      ctx.fillRect(0, 0, 1050, canvasHeight);

      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.beginPath();
      ctx.roundRect(25, 20, 1000, canvasHeight - 40, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Header
      ctx.fillStyle = "rgba(0,255,200,0.10)";
      ctx.fillRect(45, 35, 960, 2);
      ctx.fillStyle = "#00ffc8";
      ctx.font = "bold 34px 'Segoe UI', sans-serif";
      ctx.fillText("TOP 10 DI-ABLO PLAYERS", 50, 85);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "17px 'Segoe UI', sans-serif";
      ctx.fillText("RANKED BY TOTAL LEVEL & BALANCE", 50, 115);

      let y = 150;
      for (let i = 0; i < sorted.length; i++) {
        const u = sorted[i];
        const rank = i + 1;
        const isTop3 = rank <= 3;
        const name = u.userName || u.userID;

        const adv = u.adventure || {};
        const mine = u.mining || {};
        const fish = u.fishing || {};

        // Row
        ctx.fillStyle = isTop3 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)";
        ctx.beginPath();
        ctx.roundRect(40, y, 970, 85, 12);
        ctx.fill();
        ctx.strokeStyle = isTop3 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Rank
        ctx.fillStyle = isTop3 ? "#ffd700" : "#8a9ca0";
        ctx.font = "bold 28px 'Segoe UI', sans-serif";
        ctx.fillText("#" + rank, 60, y + 56);

        // Avatar
        try {
          const avatarUrl = `https://graph.facebook.com/${u.userID}/picture?height=100&width=100&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const img = await loadImage(avatarUrl);
          ctx.save();
          ctx.beginPath();
          ctx.arc(145, y + 42, 32, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 113, y + 10, 64, 64);
          ctx.restore();
        } catch (e) {
          ctx.fillStyle = "#5a6a6f";
          ctx.font = "bold 34px 'Segoe UI', sans-serif";
          ctx.fillText(name.charAt(0).toUpperCase(), 133, y + 58);
        }

        // Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px 'Segoe UI', sans-serif";
        const displayName = name.length > 16 ? name.slice(0, 14) + "…" : name;
        ctx.fillText(displayName, 200, y + 34);

        // Titles
        ctx.fillStyle = "#8a9ca0";
        ctx.font = "15px 'Segoe UI', sans-serif";
        ctx.fillText("ADV", 200, y + 62);
        ctx.fillStyle = "#ff6b6b";
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.fillText((adv.title || "novice").toUpperCase(), 200, y + 84);

        ctx.fillStyle = "#8a9ca0";
        ctx.font = "15px 'Segoe UI', sans-serif";
        ctx.fillText("MINE", 340, y + 62);
        ctx.fillStyle = "#ffd93d";
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.fillText((mine.title || "miner").toUpperCase(), 340, y + 84);

        ctx.fillStyle = "#8a9ca0";
        ctx.font = "15px 'Segoe UI', sans-serif";
        ctx.fillText("FISH", 480, y + 62);
        ctx.fillStyle = "#6bcbff";
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.fillText((fish.title || "angler").toUpperCase(), 480, y + 84);

        // Levels
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillText("Lv." + (adv.level || 1), 640, y + 40);
        ctx.fillText("Lv." + (mine.level || 1), 740, y + 40);
        ctx.fillText("Lv." + (fish.level || 1), 840, y + 40);

        // Total Level & Balance
        ctx.textAlign = "right";
        ctx.fillStyle = "#00ffc8";
        ctx.font = "bold 26px 'Segoe UI', sans-serif";
        ctx.fillText("TLv." + u.totalLevel, 970, y + 34);
        ctx.fillStyle = "#fdd663";
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillText("$" + this.formatMoney(u.totalBalance), 970, y + 66);
        ctx.textAlign = "left";

        y += 100;
      }

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(45, canvasHeight - 30, 960, 1);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.font = "13px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO GAME TOP 10  |  " + senderID, 50, canvasHeight - 8);

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `gametop_${senderID}_${Date.now()}.png`);
      await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

      const payload = {
        body: "[ DI-ABLO GAME LEADERBOARD ]",
        attachment: fs.createReadStream(cachePath)
      };

      const cleanup = () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); };
      return message?.reply ? message.reply(payload, cleanup) : api.sendMessage(payload, event.threadID, cleanup, event.messageID);

    } catch (err) {
      console.error("GameTop Error:", err);
      return sendMsg("❌ Could not generate leaderboard.");
    }
  }
};
const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

// Import models (assumed they are already defined in other files)
const MinerUser = mongoose.model("DiabloMinerUser");
const FisherUser = mongoose.model("DiabloFisherUser");
const AdventureUser = mongoose.model("DiabloAdventureUser");

module.exports = {
  config: {
    name: "gamebal",
    aliases: ["gbal", "allbal"],
    version: "2.0.0",
    author: "protik shah",
    countDown: 5,
    role: 0,
    shortDescription: "show all game stats (adventure, mining, fishing)",
    category: "game",
    guide: { en: "{p}gamebal [@mention]" }
  },

  formatMoney: (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  },

  onStart: async function ({ api, event, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID, mentions } = event;

    const targetID = Object.keys(mentions || {})[0] || senderID;

    try {
      const [miner, fisher, adv] = await Promise.all([
        MinerUser.findOne({ userID: targetID }),
        FisherUser.findOne({ userID: targetID }),
        AdventureUser.findOne({ userID: targetID })
      ]);

      const defaultData = { balance: 1000, level: 1, title: "novice", xp: 0 };
      const m = miner || defaultData;
      const f = fisher || defaultData;
      const a = adv || defaultData;

      const totalLevel = (m.level || 1) + (f.level || 1) + (a.level || 1);
      const totalBalance = (m.balance || 0) + (f.balance || 0) + (a.balance || 0);

      let targetName = targetID;
      try {
        const info = await api.getUserInfo(targetID);
        targetName = info[targetID]?.name || targetID;
      } catch (e) {}

      const canvas = createCanvas(1100, 650);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0b1215";
      ctx.fillRect(0, 0, 1100, 650);

      // Glass panel
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.roundRect(30, 20, 1040, 610, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top bar
      ctx.fillStyle = "rgba(0,255,200,0.10)";
      ctx.fillRect(50, 35, 1000, 2);
      ctx.fillStyle = "#00ffc8";
      ctx.font = "bold 32px 'Segoe UI', sans-serif";
      ctx.fillText("✦  ALL GAME STATS", 55, 85);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "17px 'Segoe UI', sans-serif";
      ctx.fillText("ADVENTURE · MINING · FISHING", 55, 115);

      // Avatar (right side)
      const avatarX = 780, avatarY = 160, avatarSize = 180;
      try {
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=400&width=400&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarImg = await loadImage(avatarUrl);
        ctx.save();
        ctx.shadowColor = "rgba(0,255,200,0.15)";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        ctx.strokeStyle = "rgba(0,255,200,0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 4, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {
        ctx.fillStyle = "#5a6a6f";
        ctx.font = "bold 50px 'Segoe UI', sans-serif";
        ctx.fillText(targetName.charAt(0).toUpperCase(), 845, 330);
      }

      // User name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px 'Segoe UI', sans-serif";
      const displayName = targetName.length > 20 ? targetName.slice(0, 18) + "…" : targetName;
      ctx.fillText(displayName, 55, 180);

      // Total stats
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "17px 'Segoe UI', sans-serif";
      ctx.fillText("TOTAL LEVEL", 55, 225);
      ctx.fillStyle = "#00ffc8";
      ctx.font = "bold 32px 'Segoe UI', sans-serif";
      ctx.fillText(totalLevel, 55, 265);

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "17px 'Segoe UI', sans-serif";
      ctx.fillText("TOTAL BALANCE", 55, 310);
      ctx.fillStyle = "#fdd663";
      ctx.font = "bold 32px 'Segoe UI', sans-serif";
      ctx.fillText("$" + this.formatMoney(totalBalance), 55, 350);

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(55, 380, 620, 1);

      // Adventure column
      const col1 = 55, col2 = 290, col3 = 520, yStart = 410;
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText("⚔️ ADVENTURE", col1, yStart);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Segoe UI', sans-serif";
      ctx.fillText("Lv." + (a.level || 1), col1, yStart + 40);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("TITLE", col1, yStart + 75);
      ctx.fillStyle = "#e6c87a";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText((a.title || "novice").toUpperCase(), col1, yStart + 105);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("BALANCE", col1, yStart + 140);
      ctx.fillStyle = "#fdd663";
      ctx.font = "bold 22px 'Segoe UI', sans-serif";
      ctx.fillText("$" + this.formatMoney(a.balance || 0), col1, yStart + 172);

      // Mining column
      ctx.fillStyle = "#ffd93d";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText("⛏️ MINING", col2, yStart);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Segoe UI', sans-serif";
      ctx.fillText("Lv." + (m.level || 1), col2, yStart + 40);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("TITLE", col2, yStart + 75);
      ctx.fillStyle = "#e6c87a";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText((m.title || "miner").toUpperCase(), col2, yStart + 105);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("BALANCE", col2, yStart + 140);
      ctx.fillStyle = "#fdd663";
      ctx.font = "bold 22px 'Segoe UI', sans-serif";
      ctx.fillText("$" + this.formatMoney(m.balance || 0), col2, yStart + 172);

      // Fishing column
      ctx.fillStyle = "#6bcbff";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText("🎣 FISHING", col3, yStart);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Segoe UI', sans-serif";
      ctx.fillText("Lv." + (f.level || 1), col3, yStart + 40);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("TITLE", col3, yStart + 75);
      ctx.fillStyle = "#e6c87a";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText((f.title || "angler").toUpperCase(), col3, yStart + 105);
      ctx.fillStyle = "#a0b4b8";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("BALANCE", col3, yStart + 140);
      ctx.fillStyle = "#fdd663";
      ctx.font = "bold 22px 'Segoe UI', sans-serif";
      ctx.fillText("$" + this.formatMoney(f.balance || 0), col3, yStart + 172);

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(50, 615, 1000, 1);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "14px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO GAME STATS  |  " + targetID, 55, 636);

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `gamebal_${targetID}_${Date.now()}.png`);
      await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

      const payload = {
        body: "DI-ABLO ALL GAME STATS ",
        attachment: fs.createReadStream(cachePath)
      };

      const cleanup = () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); };
      return message?.reply ? message.reply(payload, cleanup) : api.sendMessage(payload, event.threadID, cleanup, event.messageID);

    } catch (err) {
      console.error("GameBal Error:", err);
      return sendMsg("❌ Could not generate stats.");
    }
  }
};
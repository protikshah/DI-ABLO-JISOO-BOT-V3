const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "top",
    aliases: ["topbal", "leaderboard", "lb"],
    version: "6.0.0",
    author: "protik shah",
    countDown: 5,
    role: 0,
    shortDescription: "top 10 richest users (premium leaderboard)",
    category: "banking",
    guide: { en: "{p}top" }
  },

  formatMoney: (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;

    try {
      const topUsers = await BankUser.find().sort({ balance: -1 }).limit(10);
      if (!topUsers || topUsers.length === 0) return sendMsg("❌ No banking data found.");

      const canvasHeight = 160 + topUsers.length * 100;
      const canvas = createCanvas(1050, canvasHeight);
      const ctx = canvas.getContext("2d");

      // === Background Gradient ===
      const grad = ctx.createLinearGradient(0, 0, 1050, canvasHeight);
      grad.addColorStop(0, "#070d17");
      grad.addColorStop(0.5, "#0d1825");
      grad.addColorStop(1, "#04090f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1050, canvasHeight);

      // === Subtle Grid ===
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1050; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1050, y);
        ctx.stroke();
      }

      // === Glass Panel ===
      ctx.save();
      ctx.shadowColor = "rgba(0,200,255,0.05)";
      ctx.shadowBlur = 50;
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.beginPath();
      ctx.roundRect(25, 20, 1000, canvasHeight - 40, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // === Header ===
      ctx.fillStyle = "rgba(0,200,255,0.08)";
      ctx.fillRect(45, 35, 960, 2);

      ctx.fillStyle = "#c0d4e0";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO BANK", 50, 65);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 32px 'Segoe UI', sans-serif";
      ctx.fillText("TOP 10 RICHEST USERS", 50, 108);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "15px 'Segoe UI', sans-serif";
      ctx.fillText("RANKED BY BALANCE", 50, 135);

      let y = 160;

      for (let i = 0; i < topUsers.length; i++) {
        const u = topUsers[i];
        const rank = i + 1;
        const isTop3 = rank <= 3;

        let name = u.userID;
        try {
          const info = await api.getUserInfo(u.userID);
          name = info[u.userID]?.name || u.userID;
        } catch (e) {}

        // === Row Background ===
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = isTop3 ? "rgba(0,200,255,0.04)" : "rgba(255,255,255,0.02)";
        ctx.beginPath();
        ctx.roundRect(40, y, 970, 85, 14);
        ctx.fill();
        ctx.strokeStyle = isTop3 ? "rgba(0,200,255,0.12)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // === Rank Badge ===
        ctx.save();
        ctx.shadowColor = isTop3 ? "rgba(0,200,255,0.2)" : "transparent";
        ctx.shadowBlur = 15;
        ctx.fillStyle = isTop3 ? "#00e5ff" : "#6a8a9a";
        ctx.font = "bold 28px 'Segoe UI', sans-serif";
        ctx.fillText("#" + rank, 60, y + 56);
        ctx.restore();

        // === Avatar ===
        try {
          const avatarUrl = `https://graph.facebook.com/${u.userID}/picture?height=100&width=100&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const img = await loadImage(avatarUrl);
          ctx.save();
          ctx.shadowColor = "rgba(0,200,255,0.08)";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(145, y + 42, 32, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 113, y + 10, 64, 64);
          ctx.restore();
          ctx.strokeStyle = isTop3 ? "rgba(0,200,255,0.25)" : "rgba(255,255,255,0.08)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(145, y + 42, 32, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          ctx.fillStyle = "#4a5a6a";
          ctx.font = "bold 34px 'Segoe UI', sans-serif";
          ctx.fillText(name.charAt(0).toUpperCase(), 133, y + 58);
        }

        // === Name ===
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px 'Segoe UI', sans-serif";
        const displayName = name.length > 18 ? name.slice(0, 16) + "…" : name;
        ctx.fillText(displayName, 200, y + 34);

        // === User ID (sub) ===
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "13px 'Segoe UI', sans-serif";
        ctx.fillText(u.userID, 200, y + 60);

        // === Balance (right aligned, big) ===
        ctx.textAlign = "right";
        ctx.save();
        ctx.shadowColor = isTop3 ? "rgba(0,200,255,0.1)" : "transparent";
        ctx.shadowBlur = 10;
        ctx.fillStyle = isTop3 ? "#00e5ff" : "#90b8c8";
        ctx.font = "bold 30px 'Segoe UI', sans-serif";
        ctx.fillText("$" + this.formatMoney(u.balance), 960, y + 54);
        ctx.restore();
        ctx.textAlign = "left";

        // === Top 3 Crown ===
        if (isTop3) {
          const crown = rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉";
          ctx.font = "28px 'Segoe UI', sans-serif";
          ctx.fillText(crown, 920, y + 48);
        }

        y += 100;
      }

      // === Footer ===
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(45, canvasHeight - 30, 960, 1);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO LEADERBOARD v6.0  |  REQUESTED BY: " + senderID, 50, canvasHeight - 8);

      // === Save & Send ===
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `top_${senderID}_${Date.now()}.png`);
      await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

      const payload = {
        body: "🏆 [ DI-ABLO TOP 10 LEADERBOARD ]",
        attachment: fs.createReadStream(cachePath)
      };

      const cleanup = () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); };
      return message?.reply ? message.reply(payload, cleanup) : api.sendMessage(payload, event.threadID, cleanup, event.messageID);

    } catch (err) {
      console.error("Top Leaderboard Error:", err);
      return sendMsg("❌ Could not generate leaderboard.");
    }
  }
};
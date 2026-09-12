const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 1000 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "bal",
    aliases: ["balance", "money", "wallet", "profile"],
    version: "6.0.0",
    author: "protik shah",
    countDown: 5,
    role: 0,
    shortDescription: "check bank balance (premium card)",
    category: "banking",
    guide: { en: "{p}bal [@mention]" }
  },

  formatMoney: (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID, mentions } = event;

    const targetID = Object.keys(mentions || {})[0] || senderID;

    try {
      let user = await BankUser.findOne({ userID: targetID });
      if (!user) user = await BankUser.create({ userID: targetID, balance: 1000 });

      let targetName = targetID;
      try {
        const info = await api.getUserInfo(targetID);
        targetName = info[targetID]?.name || targetID;
      } catch (e) {}

      const canvas = createCanvas(1000, 540);
      const ctx = canvas.getContext("2d");

      // === Background Gradient ===
      const grad = ctx.createLinearGradient(0, 0, 1000, 540);
      grad.addColorStop(0, "#0a0f1a");
      grad.addColorStop(0.6, "#0f1a2a");
      grad.addColorStop(1, "#060b12");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1000, 540);

      // === Subtle Grid ===
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1000; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 540);
        ctx.stroke();
      }
      for (let y = 0; y < 540; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }

      // === Glass Card ===
      ctx.save();
      ctx.shadowColor = "rgba(0,200,255,0.08)";
      ctx.shadowBlur = 60;
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.roundRect(30, 20, 940, 500, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // === Top Accent Bar ===
      ctx.fillStyle = "rgba(0,200,255,0.12)";
      ctx.fillRect(50, 32, 900, 2);

      // === Title ===
      ctx.fillStyle = "#c0d4e0";
      ctx.font = "14px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO BANK", 55, 58);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.fillText("✦ PREMIUM CARD", 55, 92);

      // === Avatar (Right Side) ===
      const avatarX = 770, avatarY = 120, avatarSize = 160;
      try {
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=400&width=400&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const img = await loadImage(avatarUrl);
        ctx.save();
        ctx.shadowColor = "rgba(0,200,255,0.2)";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        ctx.strokeStyle = "rgba(0,200,255,0.3)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 4, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {
        ctx.fillStyle = "#5a6a7f";
        ctx.font = "bold 60px 'Segoe UI', sans-serif";
        ctx.fillText(targetName.charAt(0).toUpperCase(), 830, 250);
      }

      // === Card Holder Name ===
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "14px 'Segoe UI', sans-serif";
      ctx.fillText("CARD HOLDER", 55, 160);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px 'Segoe UI', sans-serif";
      const displayName = targetName.length > 22 ? targetName.slice(0, 20) + "…" : targetName;
      ctx.fillText(displayName, 55, 202);

      // === User ID ===
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "13px 'Segoe UI', sans-serif";
      ctx.fillText("USER ID", 55, 245);

      ctx.fillStyle = "#a0c4d0";
      ctx.font = "18px 'Segoe UI', sans-serif";
      ctx.fillText(targetID, 55, 272);

      // === Balance ===
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("BALANCE", 55, 320);

      ctx.save();
      ctx.shadowColor = "rgba(0,200,255,0.15)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 52px 'Segoe UI', sans-serif";
      ctx.fillText("$" + this.formatMoney(user.balance), 55, 388);
      ctx.restore();

      // === Premium Badge ===
      ctx.save();
      ctx.fillStyle = "rgba(0,200,255,0.06)";
      ctx.beginPath();
      ctx.roundRect(55, 420, 240, 42, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,200,255,0.15)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.fillText("✦ CARD TYPE : PREMIUM VIP", 70, 447);

      // === Footer ===
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(50, 500, 900, 1);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-ABLO BANKING SYSTEM", 55, 520);

      // === Save & Send ===
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `bal_${targetID}_${Date.now()}.png`);
      await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

      const payload = {
        body: `💳 [ DI-ABLO BANK CARD ]`,
        attachment: fs.createReadStream(cachePath)
      };

      const cleanup = () => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); };
      return message?.reply ? message.reply(payload, cleanup) : api.sendMessage(payload, event.threadID, cleanup, event.messageID);

    } catch (err) {
      console.error("Bal Card Error:", err);
      return sendMsg("❌ Could not generate balance card.");
    }
  }
};
const os = require("os");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

let createCanvas, loadImage;
try {
  const canvasPkg = require("canvas");
  createCanvas = canvasPkg.createCanvas;
  loadImage = canvasPkg.loadImage;
} catch (e) {
  console.log("Canvas package missing! Standard text mode active.");
}

process.stderr.clearLine = process.stderr.clearLine || function () {};
process.stdout.clearLine = process.stdout.clearLine || function () {};

module.exports = {
  config: {
    name: "uptime",
    aliases: ["runtime", "up"],
    version: "3.5.0",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Check system uptime with large text stylish profile card" },
    longDescription: { en: "Displays system status with user profile avatar and readable big text dashboard layout." },
    category: "SYSTEM",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    // 🛡️ AUTHOR VERIFICATION LOCK SYSTEM
    const allowedAuthors = ["Protik Shah", "Protik shah", "DI-ABLO JI-SOO"];
    const currentAuthor = this.config ? (this.config.author || this.config.credits || "") : "";
    
    const isValidAuthor = allowedAuthors.some(author => currentAuthor.includes(author));

    if (!isValidAuthor) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      }
      return api.sendMessage(
        "⚠️ [ 𝑆𝐸𝐶𝑈𝑅𝐼𝑇𝑌 𝐴𝐿𝐸𝑅𝑇 ] ⚠️\n\n" +
        "❌ Unauthorized Modification Detected!\n" +
        "This command has been locked because original Author credits were altered.\n\n" +
        "👑 Original Author: Protik Shah",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID, senderID } = event;
    const cacheFolderPath = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath, { recursive: true });
    const imagePath = path.join(cacheFolderPath, `uptime_${Date.now()}.png`);

    try {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("📡", event.messageID, () => {}, true);
      }

      // System Information Calculations
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const usedGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);
      const totalGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);

      const cpus = os.cpus();
      let totalIdle = 0, totalTick = 0;
      cpus.forEach(cpu => {
        for (const type in cpu.times) totalTick += cpu.times[type];
        totalIdle += cpu.times.idle;
      });
      const avgCpuLoad = ((1 - totalIdle / totalTick) * 100).toFixed(2);

      const ping = Math.abs(Date.now() - event.timestamp);
      const platform = `${os.platform()} (${os.arch()})`;
      const nodeVersion = process.version;
      const hostname = os.hostname();

      // Get User Name
      let userName = "Protik Shah";
      try {
        const userInfo = await api.getUserInfo(senderID);
        if (userInfo && userInfo[senderID]) {
          userName = userInfo[senderID].name || "Protik Shah";
        }
      } catch (e) {}

      const info = [
        { label: "SYSTEM UPTIME", value: uptimeString, icon: "⏱️" },
        { label: "BOT LATENCY (PING)", value: `${ping} ms`, icon: "📶" },
        { label: "RAM USAGE", value: `${usedGB} GB / ${totalGB} GB`, icon: "💾" },
        { label: "CPU LOAD", value: `${avgCpuLoad}%`, icon: "⚙️" },
        { label: "OS PLATFORM", value: platform, icon: "🖥️" },
        { label: "NODE.JS VERSION", value: nodeVersion, icon: "🟢" },
        { label: "SERVER HOSTNAME", value: hostname, icon: "🌐" }
      ];

      if (!createCanvas || !loadImage) {
        let textMsg = `⚡ [ SYSTEM DASHBOARD ] ⚡\n👤 Admin: ${userName}\n\n`;
        info.forEach(item => { textMsg += `${item.icon} ${item.label}: ${item.value}\n`; });
        textMsg += "\n💻Dev: Protik Shah";
        return api.sendMessage(textMsg, threadID, messageID);
      }

      // 🎨 CANVAS RENDERING (1300x750 for bigger visual room)
      const width = 1300;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background Dark Cyberpunk Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(0.5, '#070a14');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer Glowing Border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 5;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      // ================= LEFT PROFILE SIDEBAR =================
      const sideBarWidth = 380;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(35, 35, sideBarWidth, height - 70);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, sideBarWidth, height - 70);

      // User Profile Avatar
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      try {
        const avatarRes = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        const avatarImg = await loadImage(Buffer.from(avatarRes.data, "utf-8"));
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(225, 175, 85, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 140, 90, 170, 170);
        ctx.restore();

        // Avatar Outer Glow Ring
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(225, 175, 87, 0, Math.PI * 2, true);
        ctx.stroke();
      } catch (e) {
        console.log("Avatar Load Error:", e.message);
      }

      // User Profile Details (Larger Fonts)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      const shortName = userName.length > 16 ? userName.substring(0, 16) + '...' : userName;
      ctx.fillText(shortName, 225, 305);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('SYSTEM CONTROLLER', 225, 340);

      // Status Indicator
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(145, 380, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('Server Online', 225, 385);

      // Sidebar Footer Badge (Protik Shah Credit)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(55, 610, 340, 65);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(55, 610, 340, 65);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('DEVELOPER', 225, 635);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Protik Shah', 225, 660);

      // ================= RIGHT STATS AREA =================
      const startX = 450;
      const startY = 50;

      // Header Title (Bigger Text)
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🛰️ DI-ABLO PERFORMANCE MONITOR', startX, startY + 25);

      // Subtitle Line
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY + 45);
      ctx.lineTo(width - 45, startY + 45);
      ctx.stroke();

      // Stats List Rows with Increased Height & Fonts
      const rowHeight = 78;
      info.forEach((item, i) => {
        const yPos = startY + 75 + i * rowHeight;

        // Card Container
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(startX, yPos, 805, 62);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, yPos, 805, 62);

        // Icon & Label (Larger Font)
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.icon}  ${item.label}`, startX + 25, yPos + 38);

        // Value (Larger & Bold Font)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.value, startX + 780, yPos + 38);
      });

      // Output Stream & Clean up
      const out = fs.createWriteStream(imagePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', () => {
        if (api && typeof api.setMessageReaction === "function") {
          api.setMessageReaction("✔️", event.messageID, () => {}, true);
        }
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, threadID, (err) => {
          if (fs.existsSync(imagePath)) fs.unlink(imagePath, () => {});
        }, messageID);
      });

    } catch (error) {
      console.error(error);
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      if (fs.existsSync(imagePath)) fs.unlink(imagePath, () => {});
    }
  }
};
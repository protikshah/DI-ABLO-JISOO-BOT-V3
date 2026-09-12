const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draw circular avatar safely
async function drawCircleAvatar(ctx, url, cx, cy, radius, borderColor, shadow = true) {
  try {
    const img = await loadImage(url);
    ctx.save();
    if (shadow) {
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 25;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();

    // border ring
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  } catch (e) {
    // fallback circle
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

module.exports = {
  config: {
    name: "welcome",
    version: "9.0.0",
    author: "DI-AB-LO",
    category: "events",
    description: "🌟 Smart Welcome Card"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;
    const { threadID, logMessageData, author } = event;
    const addedParticipants = logMessageData.addedParticipants;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "DI-ABLO Realm";
      const memberCount = threadInfo.participantIDs.length;
      const groupIconUrl = threadInfo.imageSrc ||
        "https://i.ibb.co/L5k6NvZ/bg2.jpg";

      for (const user of addedParticipants) {
        const userID = user.userFbId;
        const userName = user.fullName;
        const adderID = author;
        const isSelfJoin = !adderID || adderID === userID;
        const timeNow = moment().tz("Asia/Dhaka").format("hh:mm A · DD MMM YYYY");

        const canvas = createCanvas(1000, 500);
        const ctx = canvas.getContext("2d");

        // ===== GROUP ICON BACKGROUND (rounded + blurred) =====
        try {
          const bgImg = await loadImage(groupIconUrl);
          ctx.save();
          roundRect(ctx, 0, 0, canvas.width, canvas.height, 0);
          ctx.clip();
          ctx.filter = "blur(18px) brightness(0.5)";
          ctx.drawImage(bgImg, -40, -40, canvas.width + 80, canvas.height + 80);
          ctx.restore();
          ctx.filter = "none";
        } catch (e) {
          ctx.fillStyle = "#0a0e17";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Dark gradient overlay
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "rgba(6, 12, 24, 0.88)");
        grad.addColorStop(1, "rgba(2, 6, 14, 0.94)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Left panel rounded glass
        ctx.fillStyle = "rgba(0, 242, 254, 0.05)";
        roundRect(ctx, 30, 30, 380, 440, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // ===== AVATARS =====
        const targetUrl = `https://graph.facebook.com/${userID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const adderUrl = `https://graph.facebook.com/${adderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        if (isSelfJoin) {
          // self join - single big avatar
          await drawCircleAvatar(ctx, targetUrl, 220, 220, 105, "#00f2fe");
        } else {
          // new member (BIG) center-bottom
          await drawCircleAvatar(ctx, targetUrl, 250, 220, 105, "#00f2fe");
          // adder (SMALL) left-top
          await drawCircleAvatar(ctx, adderUrl, 110, 110, 55, "#ffffff");
          // small + icon
          ctx.fillStyle = "#00f2fe";
          ctx.beginPath();
          ctx.arc(160, 160, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#06121f";
          ctx.font = "bold 26px 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("+", 160, 170);
        }

        // Left label
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0, 242, 254, 0.9)";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.fillText("✦ NEW MEMBER ✦", 220, 380);

        // ===== RIGHT PANEL =====
        ctx.textAlign = "left";

        // Header
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 46px 'Segoe UI', sans-serif";
        ctx.fillText("WELCOME", 450, 100);

        // Name (glow)
        ctx.shadowColor = "rgba(0, 242, 254, 0.5)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#00f2fe";
        ctx.font = "bold 36px 'Segoe UI', sans-serif";
        const shortName = userName.length > 18 ? userName.slice(0, 18) + "…" : userName;
        ctx.fillText(shortName, 450, 160);
        ctx.shadowBlur = 0;

        // Message strip
        roundRect(ctx, 450, 200, 520, 62, 14);
        ctx.fillStyle = "rgba(0, 242, 254, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#d6f6ff";
        ctx.font = "22px 'Segoe UI', sans-serif";
        ctx.fillText("💬 Welcome to the realm, enjoy!", 475, 240);

        // Group strip
        roundRect(ctx, 450, 280, 520, 62, 14);
        ctx.fillStyle = "rgba(0, 242, 254, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#00f2fe";
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        const shortGroup = threadName.length > 22 ? threadName.slice(0, 22) + "…" : threadName;
        ctx.fillText(`🏷️  ${shortGroup}`, 475, 320);

        // Member badge
        roundRect(ctx, 450, 370, 220, 58, 14);
        ctx.fillStyle = "#00f2fe";
        ctx.fill();
        ctx.fillStyle = "#06121f";
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillText(`👥  #${memberCount}`, 480, 408);

        // Time badge
        roundRect(ctx, 690, 370, 280, 58, 14);
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "#9fb3c8";
        ctx.font = "18px 'Segoe UI', sans-serif";
        ctx.fillText(`🕒 ${timeNow}`, 715, 408);

        // Footer
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(450, 460, 520, 1);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "14px 'Segoe UI', sans-serif";
        ctx.fillText("✦ DI-AB-LO bot WELCOME MSG", 450, 482);

        // Save & send
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const cardPath = path.join(cacheDir, `welcome_${userID}.png`);
        fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

        await api.sendMessage(
          {
            body: `✨${userName} joined ${threadName}!`,
            attachment: fs.createReadStream(cardPath)
          },
          threadID,
          () => { if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath); }
        );
      }
    } catch (err) {
      console.error("Welcome Error:", err);
    }
  }
};
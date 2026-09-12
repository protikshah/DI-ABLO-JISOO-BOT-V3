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

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  } catch (e) {
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

module.exports = {
  config: {
    name: "leave",
    version: "9.0.0",
    author: "DI-AB-LO",
    category: "events",
    description: "👋 Smart Leave/Kick Card"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:unsubscribe") return;
    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID === api.getCurrentUserID()) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "DI-ABLO Realm";
      const memberCount = threadInfo.participantIDs.length;
      const groupIconUrl = threadInfo.imageSrc ||
        "https://i.ibb.co/L5k6NvZ/bg2.jpg";

      const userInfo = await api.getUserInfo(leftID);
      const userName = userInfo[leftID]?.name || "Facebook user";

      const isKicked = author && author !== leftID;
      const header = isKicked ? "KICKED" : "GOODBYE";
      const subTag = isKicked ? "🚫 MEMBER REMOVED" : "🌹 MEMBER LEFT";
      const statusMsg = isKicked ? "Removed by admin." : "Has left the group.";
      const timeNow = moment().tz("Asia/Dhaka").format("hh:mm A · DD MMM YYYY");

      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // Background
      try {
        const bgImg = await loadImage(groupIconUrl);
        ctx.save();
        roundRect(ctx, 0, 0, canvas.width, canvas.height, 0);
        ctx.clip();
        ctx.filter = "blur(18px) brightness(0.45)";
        ctx.drawImage(bgImg, -40, -40, canvas.width + 80, canvas.height + 80);
        ctx.restore();
        ctx.filter = "none";
      } catch (e) {
        ctx.fillStyle = "#12060a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "rgba(24, 6, 12, 0.9)");
      grad.addColorStop(1, "rgba(10, 2, 6, 0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Left glass panel
      ctx.fillStyle = "rgba(255, 42, 69, 0.05)";
      roundRect(ctx, 30, 30, 380, 440, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 42, 69, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Avatars
      const targetUrl = `https://graph.facebook.com/${leftID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const adminUrl = `https://graph.facebook.com/${author}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      if (!isKicked) {
        // Self leave - single avatar
        await drawCircleAvatar(ctx, targetUrl, 220, 220, 105, "#ff2a45");
      } else {
        // Kicked user (BIG) + admin (SMALL)
        await drawCircleAvatar(ctx, targetUrl, 250, 220, 105, "#ff2a45");
        await drawCircleAvatar(ctx, adminUrl, 110, 110, 55, "#ffffff");
        // small X icon
        ctx.fillStyle = "#ff2a45";
        ctx.beginPath();
        ctx.arc(160, 160, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✕", 160, 170);
      }

      // Left label
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 42, 69, 0.9)";
      ctx.font = "bold 18px 'Segoe UI', sans-serif";
      ctx.fillText(subTag, 220, 380);

      // Right panel
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 46px 'Segoe UI', sans-serif";
      ctx.fillText(header, 450, 100);

      ctx.shadowColor = "rgba(255, 42, 69, 0.5)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ff2a45";
      ctx.font = "bold 36px 'Segoe UI', sans-serif";
      const shortName = userName.length > 18 ? userName.slice(0, 18) + "…" : userName;
      ctx.fillText(shortName, 450, 160);
      ctx.shadowBlur = 0;

      // Status strip
      roundRect(ctx, 450, 200, 520, 62, 14);
      ctx.fillStyle = "rgba(255, 42, 69, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 42, 69, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffd6dc";
      ctx.font = "22px 'Segoe UI', sans-serif";
      ctx.fillText(`💔 ${statusMsg}`, 475, 240);

      // Group strip
      roundRect(ctx, 450, 280, 520, 62, 14);
      ctx.fillStyle = "rgba(255, 42, 69, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 42, 69, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ff2a45";
      ctx.font = "bold 22px 'Segoe UI', sans-serif";
      const shortGroup = threadName.length > 22 ? threadName.slice(0, 22) + "…" : threadName;
      ctx.fillText(`🏷️  ${shortGroup}`, 475, 320);

      // Member badge
      roundRect(ctx, 450, 370, 220, 58, 14);
      ctx.fillStyle = "#ff2a45";
      ctx.fill();
      ctx.fillStyle = "#1a060b";
      ctx.font = "bold 22px 'Segoe UI', sans-serif";
      ctx.fillText(`👥  ${memberCount} LEFT`, 480, 408);

      // Time badge
      roundRect(ctx, 690, 370, 280, 58, 14);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "#c8a3a9";
      ctx.font = "18px 'Segoe UI', sans-serif";
      ctx.fillText(`🕒 ${timeNow}`, 715, 408);

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(450, 460, 520, 1);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "14px 'Segoe UI', sans-serif";
      ctx.fillText("✦ DI-AB-LO BOT LEAVE MSG", 450, 482);

      // Save & send
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cardPath = path.join(cacheDir, `leave_${leftID}.png`);
      fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

      await api.sendMessage(
        {
          body: isKicked
            ? `🚫 ${userName} was removed from ${threadName}.`
            : `💔 ${userName} left ${threadName}.`,
          attachment: fs.createReadStream(cardPath)
        },
        threadID,
        () => { if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath); }
      );
    } catch (err) {
      console.error("Leave Error:", err);
    }
  }
};
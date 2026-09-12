const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "cowkiss",
        version: "1.4",
        author: "protik shah",
        role: 0,
        category: "fun",
        cooldown: 10,
        guide: {
            en: "{pn} [mention/reply/UID]",
            bn: "{pn} [মেনশন/রিপ্লাই/UID]"
        }
    },

    langs: {
        bn: {
            noTarget: "• কাকে cowkiss করবে? মেনশন, রিপ্লাই বা UID দাও",
            error: "❌ সমস্যা! %1",
            success: "✅ cowkiss সফল!"
        },
        en: {
            noTarget: "• Mention, reply, or provide UID",
            error: "❌ Error! %1",
            success: "✅ cowkiss successful!"
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID, messageReply, mentions } = event;
        let targetUID = messageReply?.senderID || Object.keys(mentions)[0] || args[0];
        if (!targetUID) {
            return api.sendMessage(getLang("noTarget"), threadID, messageID);
        }

        const COW_IMAGE_URL = "https://files.catbox.moe/ugkyy9.jpg";
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const outputPath = path.join(cacheDir, `cowkiss_${targetUID}_${Date.now()}.png`);

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // 
            const profilePicUrl = `https://graph.facebook.com/${targetUID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const [cowImg, profileImg] = await Promise.all([
                loadImage(COW_IMAGE_URL),
                loadImage(profilePicUrl)
            ]);

            // 
            const canvas = createCanvas(cowImg.width, cowImg.height);
            const ctx = canvas.getContext("2d");

            // 
            ctx.drawImage(cowImg, 0, 0, cowImg.width, cowImg.height);

            // 
            const size = 120;
            const x = cowImg.width - size - 80;
            const y = 10;

            // 
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(profileImg, x, y, size, size);
            ctx.restore();

            // 
            ctx.strokeStyle = "#FF1493";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.stroke();

            //
            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, buffer);

            //
            api.sendMessage({
                body: getLang("success"),
                attachment: fs.createReadStream(outputPath)
            }, threadID, (err) => {
                if (!err) api.setMessageReaction("🐮", messageID, () => {}, true);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);

        } catch (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            api.sendMessage(getLang("error", err.message || "Unknown error"), threadID, messageID);
        }
    }
};
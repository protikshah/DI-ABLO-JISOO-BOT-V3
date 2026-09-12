const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "gaykiss",
        version: "1.2",
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
            noTarget: "• কাকে gaykiss করবে? মেনশন, রিপ্লাই বা UID দাও",
            error: "❌ সমস্যা! %1",
            success: "✅ gaykiss সফল!"
        },
        en: {
            noTarget: "• Mention, reply, or provide UID",
            error: "❌ Error! %1",
            success: "✅ gaykiss successful!"
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID, messageReply, mentions } = event;
        let targetUID = messageReply?.senderID || Object.keys(mentions)[0] || args[0];
        if (!targetUID) {
            return api.sendMessage(getLang("noTarget"), threadID, messageID);
        }

        const BASE_IMAGE_URL = "https://files.catbox.moe/nxe3ob.jpg";
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const outputPath = path.join(cacheDir, `gaykiss_${targetUID}_${Date.now()}.png`);

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const profilePicUrl = `https://graph.facebook.com/${targetUID}/picture?type=large&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const [baseImg, profileImg] = await Promise.all([
                loadImage(BASE_IMAGE_URL),
                loadImage(profilePicUrl)
            ]);

            const canvas = createCanvas(baseImg.width, baseImg.height);
            const ctx = canvas.getContext("2d");

            // বেস ইমেজ বসাই
            ctx.drawImage(baseImg, 0, 0, baseImg.width, baseImg.height);

            // 
            const size = 150; // 
            const POS_X = baseImg.width - size - 180; // 
            const POS_Y = 10; // 

            // 
            ctx.save();
            ctx.beginPath();
            ctx.arc(POS_X + size/2, POS_Y + size/2, size/2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(profileImg, POS_X, POS_Y, size, size);
            ctx.restore();

            // 
            ctx.strokeStyle = "#FF1493";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(POS_X + size/2, POS_Y + size/2, size/2, 0, Math.PI * 2);
            ctx.stroke();

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, buffer);

            api.sendMessage({
                body: getLang("success"),
                attachment: fs.createReadStream(outputPath)
            }, threadID, (err) => {
                if (!err) api.setMessageReaction("✔️", messageID, () => {}, true);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);

        } catch (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            api.sendMessage(getLang("error", err.message || "Unknown error"), threadID, messageID);
        }
    }
};
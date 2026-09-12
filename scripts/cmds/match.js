 const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
        config: {
                name: "match",
                version: "2.0",
                author: "PROTIK SHAH",
                countDown: 10,
                role: 0,
                description: {
                        bn: "লোকাল ক্যানভাস ব্যবহার করে পারফেক্ট ম্যাচ কার্ড তৈরি করুন",
                        en: "Find your match with local canvas image rendering",
                        vi: "Tìm mảnh ghép hoàn hảo bằng Local Canvas"
                },
                category: "love",
                guide: {
                        bn: '   {pn}: আপনার ম্যাচ কার্ড তৈরি করতে ব্যবহার করুন',
                        en: '   {pn}: Use to generate your local pair match card',
                        vi: '   {pn}: Sử dụng để tạo thẻ ghép đôi'
                }
        },

        langs: {
                bn: {
                        noGender: "× বেবি, আপনার জেন্ডার প্রোফাইলে সেট করা নেই",
                        noMatch: "× দুঃখিত, এই গ্রুপে আপনার জন্য কোনো বিপরীত লিঙ্গের ম্যাচ পাওয়া যায়নি",
                        success: "💞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n• %1\n• %2\n\n𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%",
                        error: "× সমস্যা হয়েছে: %1"
                },
                en: {
                        noGender: "× Baby, your gender is not defined in your profile",
                        noMatch: "× Sorry, no match found for you in this group",
                        success: "💞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n• %1\n• %2\n\n𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%",
                        error: "× Error: %1"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const outputPath = path.join(__dirname, "cache", `pair_${event.senderID}_${Date.now()}.png`);
                if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

                try {
                        api.setMessageReaction("😽", event.messageID, () => {}, true);

                        const threadData = await api.getThreadInfo(event.threadID);
                        const users = threadData.userInfo;
                        const myData = users.find((u) => u.id === event.senderID);

                        if (!myData || !myData.gender) return message.reply(getLang("noGender"));

                        const myGender = myData.gender.toUpperCase();
                        let matchCandidates = [];

                        if (myGender === "MALE") {
                                matchCandidates = users.filter((u) => u.gender === "FEMALE" && u.id !== event.senderID);
                        } else if (myGender === "FEMALE") {
                                matchCandidates = users.filter((u) => u.gender === "MALE" && u.id !== event.senderID);
                        } else {
                                matchCandidates = users.filter((u) => u.id !== event.senderID);
                        }

                        if (matchCandidates.length === 0) {
                                api.setMessageReaction("🥺", event.messageID, () => {}, true);
                                return message.reply(getLang("noMatch"));
                        }

                        const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
                        const name1 = myData.name || "User 1";
                        const name2 = selectedMatch.name || "User 2";
                        const matchPercentage = Math.floor(Math.random() * 51) + 50; // ৫০% থেকে ১০০% এর মধ্যে

                        // প্রোফাইল পিকচার ডাউনলোড ফাংশন
                        const getAvatarBuffer = async (uid) => {
                                const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                                const res = await axios.get(avatarUrl, { responseType: "arraybuffer" });
                                return Buffer.from(res.data);
                        };

                        const [avatar1Buf, avatar2Buf] = await Promise.all([
                                getAvatarBuffer(event.senderID),
                                getAvatarBuffer(selectedMatch.id)
                        ]);

                        // --- 🎨 Canvas ইমেজিং কোড শুরু ---
                        const width = 1000;
                        const height = 562;
                        const canvas = createCanvas(width, height);
                        const ctx = canvas.getContext("2d");

                        // ১. ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট ও নোড পার্টিকেল তৈরি
                        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
                        bgGradient.addColorStop(0, "#2c023d");
                        bgGradient.addColorStop(0.5, "#6b1178");
                        bgGradient.addColorStop(1, "#d91e63");
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        // সূক্ষ্ম স্টারি ফিল্টার / ডট ট্রায়াঙ্গেল
                        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                        for (let i = 0; i < 40; i++) {
                                const rx = Math.random() * width;
                                const ry = Math.random() * height;
                                const rsize = Math.random() * 3 + 1;
                                ctx.beginPath();
                                ctx.arc(rx, ry, rsize, 0, Math.PI * 2);
                                ctx.fill();
                        }

                        // ২. মেইন ট্রান্সপারেন্ট গ্লাস কার্ড (Glassmorphism Effect)
                        ctx.save();
                        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
                        ctx.lineWidth = 2;

                        const rectX = 70, rectY = 80, rectW = 860, rectH = 400, cornerRadius = 25;
                        ctx.beginPath();
                        ctx.roundRect(rectX, rectY, rectW, rectH, cornerRadius);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();

                        // ৩. টাইটেল ও সাব-টাইটেল টেক্সট
                        ctx.textAlign = "center";
                        ctx.fillStyle = "#FFFFFF";
                        ctx.font = "bold 38px sans-serif";
                        ctx.fillText("PERFECT MATCH", width / 2, 135);

                        ctx.fillStyle = "#E0C3FC";
                        ctx.font = "italic 18px sans-serif";
                        ctx.fillText("Two hearts, one connection", width / 2, 168);

                        // ৪. কানেক্টিং আর্চ লাইন ও ডটস (Connecting Curved Line)
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = "#FF3366";
                        ctx.lineWidth = 4;
                        ctx.moveTo(340, 250);
                        ctx.quadraticCurveTo(width / 2, 200, 660, 250);
                        ctx.stroke();

                        // পয়েন্ট ডটস
                        const dotsX = [340, 420, 500, 580, 660];
                        dotsX.forEach((dx, idx) => {
                                ctx.beginPath();
                                ctx.fillStyle = idx === 2 ? "#FF0055" : (idx % 2 === 0 ? "#FF3366" : "#8A2BE2");
                                const dy = idx === 2 ? 225 : (idx === 1 || idx === 3 ? 232 : 250);
                                ctx.arc(dx, dy, idx === 2 ? 10 : 7, 0, Math.PI * 2);
                                ctx.fill();
                        });
                        ctx.restore();

                        // ৫. প্রোফাইল পিকচার ড্রয়িং ফাংশন (Circular Crop with Border)
                        const drawCircularAvatar = async (imgBuffer, x, y, radius, borderColor) => {
                                const img = await loadImage(imgBuffer);
                                ctx.save();

                                // বর্ডার
                                ctx.beginPath();
                                ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
                                ctx.fillStyle = borderColor;
                                ctx.fill();

                                // ক্লিপিং সার্কেল
                                ctx.beginPath();
                                ctx.arc(x, y, radius, 0, Math.PI * 2);
                                ctx.clip();

                                ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
                                ctx.restore();
                        };

                        const avatarY = 260;
                        const avatarRadius = 80;

                        await drawCircularAvatar(avatar1Buf, 240, avatarY, avatarRadius, "#E040FB");
                        await drawCircularAvatar(avatar2Buf, 760, avatarY, avatarRadius, "#9C27B0");

                        // ৬. ইউজারদের নাম
                        ctx.fillStyle = "#FFFFFF";
                        ctx.font = "bold 26px sans-serif";
                        ctx.textAlign = "center";
                        
                        // নাম লম্বা হলে ট্রিম করে দেওয়া
                        const trimText = (txt) => txt.length > 13 ? txt.substring(0, 11) + ".." : txt;
                        ctx.fillText(trimText(name1), 240, 385);
                        ctx.fillText(trimText(name2), 760, 385);

                        // ৭. পার্সেন্টেজ রিং অ্যান্ড টেক্সট (Percentage Ring Indicator)
                        const ringX = width / 2;
                        const ringY = 350;
                        const ringRadius = 55;

                        // ব্যাকগ্রাউন্ড ট্র‍্যাক রিং
                        ctx.beginPath();
                        ctx.arc(ringX, ringY, ringRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                        ctx.lineWidth = 12;
                        ctx.stroke();

                        // প্রোগ্রেস আর্চ রিং
                        const startAngle = -Math.PI / 2;
                        const endAngle = startAngle + (Math.PI * 2 * (matchPercentage / 100));

                        const ringGrad = ctx.createLinearGradient(ringX - ringRadius, ringY, ringX + ringRadius, ringY);
                        ringGrad.addColorStop(0, "#FF007F");
                        ringGrad.addColorStop(1, "#7B2CBF");

                        ctx.beginPath();
                        ctx.arc(ringX, ringY, ringRadius, startAngle, endAngle);
                        ctx.strokeStyle = ringGrad;
                        ctx.lineWidth = 12;
                        ctx.lineCap = "round";
                        ctx.stroke();

                        // পার্সেন্টেজ টেক্সট
                        ctx.fillStyle = "#FFFFFF";
                        ctx.font = "bold 28px sans-serif";
                        ctx.fillText(`${matchPercentage}%`, ringX, ringY + 9);

                        ctx.fillStyle = "#D8B4FE";
                        ctx.font = "bold 18px sans-serif";
                        ctx.fillText("MATCH", ringX, ringY + 80);

                        // --- 🎨 Canvas ইমেজিং শেষ ---

                        // ইমেজ ক্যাশ ফাইল সেভ
                        const buffer = canvas.toBuffer("image/png");
                        fs.writeFileSync(outputPath, buffer);

                        return message.reply({
                                body: getLang("success", name1, name2, matchPercentage),
                                attachment: fs.createReadStream(outputPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        });

                } catch (err) {
                        console.error("Local Pair Canvas Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
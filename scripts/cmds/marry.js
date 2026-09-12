const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "marry",
        aliases: ["m"],
        version: "2.4",
        author: "BADHON-00",
        countDown: 5,
        role: 0,
        shortDescription: "Get married to someone",
        longDescription: "Pairs user via reply or mention automatically with dynamic gender detection and image positioning.",
        category: "fun",
        guide: "{pn} (reply to a message) OR {pn} @mention"
    },

    onStart: async function ({ message, event, api, usersData }) {
        const mentions = Object.keys(event.mentions);
        const senderID = event.senderID;

        let targetID = null;

        if (event.type === "message_reply") {
            targetID = event.messageReply.senderID;
        } 
        else if (mentions.length > 0) {
            targetID = mentions[0];
        }

        if (!targetID) {
            return message.reply("please mention someone or reply to a message for marry him or her");
        }

        try {
            const executorName = await usersData.getName(senderID);
            const targetName = await usersData.getName(targetID);

            const executorInfo = await api.getUserInfo(senderID);
            const executorGender = executorInfo[senderID]?.gender;
            const isFemale = executorGender === 1 || executorGender === "FEMALE";

            let user1, user2;
            if (isFemale) {
                user1 = targetID;
                user2 = senderID;
            } else {
                user1 = senderID;
                user2 = targetID;
            }

            const imagePath = await generateMarryImage(user1, user2);

            const replyMessage = `congratulations ${executorName} Marry ${targetName}`;

            await message.reply({
                body: replyMessage,
                mentions: [
                    { tag: executorName, id: senderID },
                    { tag: targetName, id: targetID }
                ],
                attachment: fs.createReadStream(imagePath)
            });

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        } catch (error) {
            console.error("Marry Command Error:", error);
            return message.reply("An error occurred while generating the image. Please try again.");
        }
    }
};

function formatDriveUrl(url) {
    if (url.includes("drive.google.com")) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }
    return url;
}

async function streamImageWithFallbacks(urls) {
    for (let url of urls) {
        try {
            url = formatDriveUrl(url);
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            return await jimp.read(Buffer.from(res.data, 'binary'));
        } catch (err) {
            console.warn(`Failed to stream background image from: ${url}`);
        }
    }
    throw new Error("All background image URLs failed to stream.");
}

async function fetchAvatar(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return await jimp.read(Buffer.from(res.data, 'binary'));
    } catch (e) {
        console.warn(`Failed to fetch avatar from ${url}, returning blank placeholder.`);
        return new jimp(512, 512, 0xCCCCCCFF);
    }
}

async function generateMarryImage(one, two) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const outputPath = path.join(cacheDir, `marry_${one}_${two}.png`);

    const imageUrls = [
        "https://drive.google.com/file/d/1BUIuQ4mvjbBQftY4rJxom5ByN29IKWfL/view?usp=drivesdk",
        "https://raw.githubusercontent.com/Badhon-00/MELISSA-BOT-MINI/main/scripts/cmds/cach/Melissa/Marry.jpg",
        "https://raw.githubusercontent.com/Badhon-00/MELISSA-BOT-MINI/76a3c10ec5fa9070f5ce30d6dc7756f27552c8e7/scripts/cmds/cach/Melissa/Marry.jpg"
    ];

    const avatarURL1 = `https://graph.facebook.com/${one}/picture?width=1024&height=1024&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const avatarURL2 = `https://graph.facebook.com/${two}/picture?width=1024&height=1024&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const [avone, avtwo, background] = await Promise.all([
        fetchAvatar(avatarURL1),
        fetchAvatar(avatarURL2),
        streamImageWithFallbacks(imageUrls)
    ]);

    avone.circle();
    avtwo.circle();

    background.resize(600, 338)
              .composite(avone.resize(75, 75), 262, 0)
              .composite(avtwo.resize(80, 80), 350, 69);

    await background.writeAsync(outputPath);
    return outputPath;
}
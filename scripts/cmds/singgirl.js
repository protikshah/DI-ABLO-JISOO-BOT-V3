const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🧠 Smart Memory Array to track sent videos
let usedVideos = [];

module.exports = {
  config: {
    name: "singgirl",
    aliases: ["singinggirl", "sgirl"],
    version: "1.1",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a non-repeating Singing Girl video from catbox collection."
    },
    longDescription: {
      en: "Send a non-repeating Singing Girl video using Catbox links with custom reactions."
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // 🛡️ AUTHOR VERIFICATION LOCK SYSTEM
    const allowedAuthors = ["Protik shah", "Protik Shah"];
    const currentAuthor = this.config ? (this.config.author || this.config.credits || "") : "";
    
    const isValidAuthor = allowedAuthors.some(author => currentAuthor.includes(author));

    if (!isValidAuthor) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      }
      return api.sendMessage(
        "⚠️ [ 𝑆𝐸𝐶𝑈𝑅𝐼𝑇𝑌 𝐴𝐿𝐸𝑅𝑇 ] ⚠️\n\n" +
        "❌ 𝑈𝑛𝑎𝑢𝑡ℎ𝑜𝑟𝑖𝑧𝑒𝑑 𝑀𝑜𝑑𝑖𝑓𝑖𝑐𝑎𝑡𝑖𝑜𝑛 𝐷𝑒𝑡𝑒𝑐𝑡𝑒𝑑!\n" +
        "𝑇ℎ𝑖𝑠 𝑐𝑜𝑚𝑚𝑎𝑛𝑑 ℎ𝑎𝑠 𝑏𝑒𝑒𝑛 𝑙𝑜𝑐𝑘𝑒𝑑 𝑏𝑒𝑐𝑎𝑢𝑠𝑒 𝑡ℎ𝑒 𝑜𝑟𝑖𝑔𝑖𝑛𝑎𝑙 𝐴𝑢𝑡ℎ𝑜𝑟 𝑐𝑟𝑒𝑑𝑖𝑡𝑠 𝑤𝑒𝑟𝑒 𝑎𝑙𝑡𝑒𝑟𝑒𝑑.\n\n" +
        "👑 𝑶𝒓𝒊𝒈𝒊𝒏𝒂𝒍 𝑨𝒖𝒕𝒉𝒐𝒓: Protik Shah",
        event.threadID,
        event.messageID
      );
    }

    // 🎤 Loading reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🎤", event.messageID, (err) => {}, true);
    }

    const videos = [
      "https://files.catbox.moe/64j2e9.mp4",
      "https://files.catbox.moe/rmmylk.mp4",
      "https://files.catbox.moe/hzjhf3.mp4",
      "https://files.catbox.moe/940m54.mp4",
      "https://files.catbox.moe/vqwv4v.mp4",
      "https://files.catbox.moe/ar4jwu.mp4",
      "https://files.catbox.moe/1klhhk.mp4",
      "https://files.catbox.moe/7cp9ni.mp4",
      "https://files.catbox.moe/bpoajx.mp4",
      "https://files.catbox.moe/gzu6cv.mp4",
      "https://files.catbox.moe/pj1r2a.mp4",
      "https://files.catbox.moe/vzhgip.mp4",
      "https://files.catbox.moe/zvc83c.mp4",
      "https://files.catbox.moe/8m3s8o.mp4",
      "https://files.catbox.moe/t3kqch.mp4",
      "https://files.catbox.moe/0181ap.mp4",
      "https://files.catbox.moe/08h7s2.mp4",
      "https://files.catbox.moe/44wboe.mp4",
      "https://files.catbox.moe/48uaca.mp4"
    ];

    // 🎯 Non-Repeating Unique Selection Logic
    let availableVideos = videos.filter(v => !usedVideos.includes(v));

    if (availableVideos.length === 0) {
      usedVideos = [];
      availableVideos = [...videos];
    }

    const url = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    usedVideos.push(url);

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `singgirl_${Date.now()}.mp4`);

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: `🎤 [ SINGING GIRL VIDEO ]\n\n👤 Author: Protik Shah 🗿\n🎬 Remaining Unique: ${availableVideos.length - 1}/${videos.length}`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => {
          // 🎧 Success reaction
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("🎧", event.messageID, (err) => {}, true);
          }
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        event.messageID
      );

    } catch (error) {
      console.error("Error sending Sing Girl video:", error);

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      }

      return api.sendMessage(
        "❌ Couldn't load the video. Please try again.",
        event.threadID,
        event.messageID
      );
    }
  }
};

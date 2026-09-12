const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🧠 Smart Memory Array to track sent videos
let usedVideos = [];

module.exports = {
  config: {
    name: "romantic",
    aliases: ["rmtvid", "romanticvideo", "lovevid"],
    version: "1.1",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a non-repeating romantic video from catbox collection."
    },
    longDescription: {
      en: "Send a non-repeating romantic video using Catbox links with custom reactions."
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

    // 🤭 Loading reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🤭", event.messageID, (err) => {}, true);
    }

    const videos = [
      "https://files.catbox.moe/nbzg9q.mp4",
      "https://files.catbox.moe/f5b77c.mp4",
      "https://files.catbox.moe/x5efgi.mp4",
      "https://files.catbox.moe/c207ri.mp4",
      "https://files.catbox.moe/sdh5lz.mp4",
      "https://files.catbox.moe/hd6rqw.mp4",
      "https://files.catbox.moe/p43of7.mp4",
      "https://files.catbox.moe/tpzhd8.mp4",
      "https://files.catbox.moe/hkkyof.mp4",
      "https://files.catbox.moe/6a9pao.mp4",
      "https://files.catbox.moe/afvp8x.mp4",
      "https://files.catbox.moe/qv0ngh.mp4",
      "https://files.catbox.moe/raszev.mp4",
      "https://files.catbox.moe/5uysqj.mp4",
      "https://files.catbox.moe/e0smb2.mp4",
      "https://files.catbox.moe/j8k6tb.mp4",
      "https://files.catbox.moe/b22jc9.mp4",
      "https://files.catbox.moe/hh8oov.mp4",
      "https://files.catbox.moe/32i59h.mp4",
      "https://files.catbox.moe/nniupw.mp4",
      "https://files.catbox.moe/m40ecg.mp4",
      "https://files.catbox.moe/r21xki.mp4",
      "https://files.catbox.moe/yluc1y.mp4",
      "https://files.catbox.moe/s2jn9t.mp4",
      "https://files.catbox.moe/472w4e.mp4",
      "https://files.catbox.moe/ono1j4.mp4",
      "https://files.catbox.moe/mtrbdu.mp4",
      "https://files.catbox.moe/qfyipz.mp4",
      "https://files.catbox.moe/fnf91d.mp4",
      "https://files.catbox.moe/bl5sxg.mp4",
      "https://files.catbox.moe/2o0cw8.mp4",
      "https://files.catbox.moe/yuaqvz.mp4",
      "https://files.catbox.moe/hthphc.mp4",
      "https://files.catbox.moe/i9oasi.mp4",
      "https://files.catbox.moe/wmdos7.mp4",
      "https://files.catbox.moe/ml5lof.mp4",
      "https://files.catbox.moe/xhkpyn.mp4",
      "https://files.catbox.moe/5887oq.mp4",
      "https://files.catbox.moe/k1azqr.mp4",
      "https://files.catbox.moe/lp627q.mp4",
      "https://files.catbox.moe/d4h6jp.mp4",
      "https://files.catbox.moe/n9ta4p.mp4",
      "https://files.catbox.moe/9dgdc8.mp4"
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
    const cachePath = path.join(cacheDir, `romantic_${Date.now()}.mp4`);

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
          body: `💞 [ ROMANTIC VIDEO ]\n\n👤 Author: Protik Shah 🗿\n🎬 Remaining Unique: ${availableVideos.length - 1}/${videos.length}`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => {
          // 👀 Success reaction
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("👀", event.messageID, (err) => {}, true);
          }
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        event.messageID
      );

    } catch (error) {
      console.error("Error sending Romantic video:", error);

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

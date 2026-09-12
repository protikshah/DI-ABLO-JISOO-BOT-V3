const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 
let usedVideos = [];

module.exports = {
  config: {
    name: "girl99",
    aliases: ["girl99video", "g99"],
    version: "3.1",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a non-repeating Girl video from permanent catbox links."
    },
    longDescription: {
      en: "Send a non-repeating Girl video using permanent Catbox host."
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // 
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

    // 🌚 Loading reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🌚", event.messageID, (err) => {}, true);
    }

    const videos = [
      "https://files.catbox.moe/xktox6.mp4",
      "https://files.catbox.moe/rw1vxd.mp4",
      "https://files.catbox.moe/8r5z4r.mp4",
      "https://files.catbox.moe/2otopk.mp4",
      "https://files.catbox.moe/sg6ag6.mp4",
      "https://files.catbox.moe/2n69yc.mp4",
      "https://files.catbox.moe/tqx4i3.mp4",
      "https://files.catbox.moe/u6ppwr.mp4",
      "https://files.catbox.moe/6picwc.mp4",
      "https://files.catbox.moe/fjp6eh.mp4",
      "https://files.catbox.moe/tt12v3.mp4",
      "https://files.catbox.moe/qjb65x.mp4",
      "https://files.catbox.moe/lgg303.mp4",
      "https://files.catbox.moe/2l5de7.mp4",
      "https://files.catbox.moe/1itbo4.mp4",
      "https://files.catbox.moe/b2e4co.mp4",
      "https://files.catbox.moe/784po9.mp4",
      "https://files.catbox.moe/uthj7a.mp4",
      "https://files.catbox.moe/qf3epm.mp4",
      "https://files.catbox.moe/bzex44.mp4",
      "https://files.catbox.moe/z0pq75.mp4",
      "https://files.catbox.moe/kg8lht.mp4",
      "https://files.catbox.moe/fbgztj.mp4",
      "https://files.catbox.moe/81s5ll.mp4",
      "https://files.catbox.moe/pcefyb.mp4",
      "https://files.catbox.moe/g87uij.mp4",
      "https://files.catbox.moe/t0m4fd.mp4",
      "https://files.catbox.moe/psnyvf.mp4",
      "https://files.catbox.moe/y9581k.mp4",
      "https://files.catbox.moe/50v589.mp4",
      "https://files.catbox.moe/r1f7r2.mp4",
      "https://files.catbox.moe/vbkw1k.mp4",
      "https://files.catbox.moe/tc0jzj.mp4",
      "https://files.catbox.moe/yajxkr.mp4",
      "https://files.catbox.moe/856809.mp4",
      "https://files.catbox.moe/biihbv.mp4",
      "https://files.catbox.moe/qv4pal.mp4"
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
    const cachePath = path.join(cacheDir, `girl99_${Date.now()}.mp4`);

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
          body: `🌸 [ YOUR BABY VIDEO ]\n\n👤 Author: Protik Shah 🗿\n🎬 Remaining Unique: ${availableVideos.length - 1}/${videos.length}`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => {
          // 🌝 Reaction after success
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("🌝", event.messageID, (err) => {}, true);
          }
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        event.messageID
      );

    } catch (error) {
      console.error("Error sending Girl video:", error);

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

      // ❌ Reaction on error
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

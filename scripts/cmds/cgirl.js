const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🧠 Anti-Repeat Memory Buffer
if (!global.redgirlHistory) {
  global.redgirlHistory = [];
}

module.exports = {
  config: {
    name: "cgirl",
    aliases: ["redgirlvidseo", "rxgirl"],
    version: "2.0.0",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a non-repeating random Red Girl video from catbox collection."
    },
    longDescription: {
      en: "Send a random Red Girl video using Catbox links without repeating recent videos."
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
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
        "This command has been locked because the original Author credits were altered.\n\n" +
        "👑 Original Author: Protik Shah & DI-ABLO JI-SOO",
        event.threadID,
        event.messageID
      );
    }

    // 🍁 Loading reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🙂‍↔️", event.messageID, (err) => {}, true);
    }

    const videos = [
      "https://files.catbox.moe/8mm6kh.mp4",
      "https://files.catbox.moe/ssikpx.mp4",
      "https://files.catbox.moe/joz0lj.mp4",
      "https://files.catbox.moe/gds0hh.mp4",
      "https://files.catbox.moe/b2a2ve.mp4",
      "https://files.catbox.moe/mv9mwn.mp4",
      "https://files.catbox.moe/ropskb.mp4",
      "https://files.catbox.moe/tgfaq9.mp4",
      "https://files.catbox.moe/4ss681.mp4",
      "https://files.catbox.moe/3711f6.mp4",
      "https://files.catbox.moe/396xbs.mp4",
      "https://files.catbox.moe/tioyic.mp4",
      "https://files.catbox.moe/de8grq.mp4",
      "https://files.catbox.moe/rwvx62.mp4",
      "https://files.catbox.moe/oijjyt.mp4",
      "https://files.catbox.moe/fmb56q.mp4",
      "https://files.catbox.moe/j125v4.mp4",
      "https://files.catbox.moe/pj1r2a.mp4",
      "https://files.catbox.moe/e4lurj.mp4",
      "https://files.catbox.moe/u38xwi.mp4",
      "https://files.catbox.moe/9whci4.mp4",
      "https://files.catbox.moe/e1ou76.mp4",
      "https://files.catbox.moe/d1vksa.mp4",
      "https://files.catbox.moe/mgqwml.mp4",
      "https://files.catbox.moe/5sau1u.mp4",
      "https://files.catbox.moe/nobuhr.mp4",
      "https://files.catbox.moe/7tx3ur.mp4",
      "https://files.catbox.moe/xwu69p.mp4",
      "https://files.catbox.moe/lqmn3w.mp4",
      "https://files.catbox.moe/n92ev9.mp4",
      "https://files.catbox.moe/wh848g.mp4",
      "https://files.catbox.moe/fgfmhg.mp4",
      "https://files.catbox.moe/m7jvzy.mp4",
      "https://files.catbox.moe/o14k29.mp4",
      "https://files.catbox.moe/vk4a17.mp4",
      "https://files.catbox.moe/2xpazi.mp4",
      "https://files.catbox.moe/g7a1y9.mp4",
      "https://files.catbox.moe/srmay9.mp4",
      "https://files.catbox.moe/dhc13f.mp4",
      "https://files.catbox.moe/1al5i0.mp4",
      "https://files.catbox.moe/2bxzx0.mp4",
      "https://files.catbox.moe/nw5k61.mp4",
      "https://files.catbox.moe/f3pogm.mp4",
      "https://files.catbox.moe/o5234v.mp4",
      "https://files.catbox.moe/bex9ml.mp4",
      "https://files.catbox.moe/crt7ai.mp4",
      "https://files.catbox.moe/oymzv7.mp4"
    ];

    // Filter available videos (removing recently played ones)
    let availableVideos = videos.filter(v => !global.redgirlHistory.includes(v));

    // Reset history if all videos were recently used
    if (availableVideos.length === 0) {
      global.redgirlHistory = [];
      availableVideos = [...videos];
    }

    // Pick a non-repeated video link
    const selectedUrl = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    
    // Save to history (keep last 15 entries)
    global.redgirlHistory.push(selectedUrl);
    if (global.redgirlHistory.length > 15) {
      global.redgirlHistory.shift();
    }

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `redgirl_${event.senderID}_${Date.now()}.mp4`);

    try {
      await fs.ensureDir(cacheDir);

      // Fetch video with Anti-Cache params
      const response = await axios({
        method: "GET",
        url: `${selectedUrl}?v=${Date.now()}`,
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Cache-Control": "no-cache"
        }
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: "🍁━━━━ [ 𝑹𝑬𝑫 𝑮𝑰𝑑𝑳 𝑽𝑰𝑫𝑬𝑶 ] ━━━🍁\n\n👑 𝑨𝒖𝒕𝒉𝒐𝒓: Protik Shah",
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        (err) => {
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("🌸", event.messageID, (err) => {}, true);
          }
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        event.messageID
      );

    } catch (error) {
      console.error("Error sending Red Girl video:", error);

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
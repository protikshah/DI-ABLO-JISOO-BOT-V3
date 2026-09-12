const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🧠 Smart Memory Array to track sent videos
let usedVideos = [];

module.exports = {
  config: {
    name: "carvid",
    aliases: ["carvideo", "car", "ctavideo"],
    version: "1.1",
    author: "Protik Shah",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a non-repeating Car video from catbox collection."
    },
    longDescription: {
      en: "Send a non-repeating Car video using Catbox links with custom reactions."
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // 🛡️ AUTHOR VERIFICATION LOCK SYSTEM
    const allowedAuthors = ["Protik shah", "Protik Shah", "Pratik Shah", "Pratik shah"];
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

    // 🚗 Loading reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🏎️", event.messageID, (err) => {}, true);
    }

    const videos = [
      "https://files.catbox.moe/0l9p9g.mp4",
      "https://files.catbox.moe/g9xgk3.mp4",
      "https://files.catbox.moe/i9kq9l.mp4",
      "https://files.catbox.moe/bkptki.mp4",
      "https://files.catbox.moe/4hym9o.mp4",
      "https://files.catbox.moe/h1t0eq.mp4",
      "https://files.catbox.moe/nissh7.mp4",
      "https://files.catbox.moe/zl5ceb.mp4",
      "https://files.catbox.moe/phs9mi.mp4",
      "https://files.catbox.moe/tsxlst.mp4",
      "https://files.catbox.moe/kkwag1.mp4",
      "https://files.catbox.moe/qv3a4k.mp4",
      "https://files.catbox.moe/cgrnco.mp4",
      "https://files.catbox.moe/2gm6qo.mp4",
      "https://files.catbox.moe/vtu3lf.mp4",
      "https://files.catbox.moe/xse9eq.mp4",
      "https://files.catbox.moe/zj15wi.mp4",
      "https://files.catbox.moe/hl7wlb.mp4",
      "https://files.catbox.moe/aacdpe.mp4",
      "https://files.catbox.moe/jtqocc.mp4",
      "https://files.catbox.moe/uhcagr.mp4",
      "https://files.catbox.moe/9b8q7k.mp4",
      "https://files.catbox.moe/u0z1jk.mp4",
      "https://files.catbox.moe/2451le.mp4",
      "https://files.catbox.moe/yfpgti.mp4",
      "https://files.catbox.moe/zrdk4n.mp4",
      "https://files.catbox.moe/rblguk.mp4",
      "https://files.catbox.moe/mo1sfj.mp4",
      "https://files.catbox.moe/92398l.mp4",
      "https://files.catbox.moe/copb3j.mp4",
      "https://files.catbox.moe/4bpi79.mp4",
      "https://files.catbox.moe/r2vjo8.mp4",
      "https://files.catbox.moe/c4l7oz.mp4",
      "https://files.catbox.moe/3hp1ae.mp4",
      "https://files.catbox.moe/oomw3m.mp4",
      "https://files.catbox.moe/9byqs5.mp4",
      "https://files.catbox.moe/3brs55.mp4",
      "https://files.catbox.moe/s2hfbb.mp4",
      "https://files.catbox.moe/xpe5vr.mp4",
      "https://files.catbox.moe/gmhvn4.mp4",
      "https://files.catbox.moe/ji8ed0.mp4",
      "https://files.catbox.moe/f8libl.mp4",
      "https://files.catbox.moe/mgds7o.mp4",
      "https://files.catbox.moe/1zkv6q.mp4",
      "https://files.catbox.moe/2chyto.mp4",
      "https://files.catbox.moe/aqkgum.mp4",
      "https://files.catbox.moe/8q2wp7.mp4",
      "https://files.catbox.moe/tentry.mp4",
      "https://files.catbox.moe/58sy32.mp4",
      "https://files.catbox.moe/p3cm9k.mp4",
      "https://files.catbox.moe/mftdop.mp4",
      "https://files.catbox.moe/0rawho.mp4"
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
    const cachePath = path.join(cacheDir, `carvid_${Date.now()}.mp4`);

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
          body: `🏎️ [ CAR VIDEO ]\n\n👤 Author: Protik Shah 🗿\n🎬 Remaining Unique: ${availableVideos.length - 1}/${videos.length}`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => {
          // 🔥 Success reaction
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("🚘", event.messageID, (err) => {}, true);
          }
          if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
          }
        },
        event.messageID
      );

    } catch (error) {
      console.error(error);
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      api.sendMessage("❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  }
};
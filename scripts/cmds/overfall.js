const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "overall",
    aliases: ["over"],
    version: "1.0",
    author: "DI-ABLO",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Watch Overall Anime Series episodes (1-8)."
    },
    longDescription: {
      en: "Stream Overall Anime Series episodes directly in chat. Usage: !overall ep 1 or !over 1"
    },
    category: "anime",
    guide: {
      en: "{pn} ep <episode_number> or {pn} <episode_number>"
    }
  },

  onStart: async function ({ api, event, args }) {
    // 🛡️ AUTHOR VERIFICATION LOCK SYSTEM
    const allowedAuthors = ["DI-ABLO", "di-ablo", "Di-Ablo"];
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
        "👑 𝑶𝒓𝒊𝒈𝒊𝒏𝒂𝒍 𝑨𝒖𝒕𝒉𝒐𝒓: DI-ABLO",
        event.threadID,
        event.messageID
      );
    }

    // 📺 8 Episodes Database Map
    const animeEpisodes = {
      1: "https://files.catbox.moe/trfy1q.mp4",
      2: "https://files.catbox.moe/0kpjtd.mp4",
      3: "https://files.catbox.moe/z34p1f.mp4",
      4: "https://files.catbox.moe/3z4ahf.mp4",
      5: "https://files.catbox.moe/zx4u4m.mp4",
      6: "https://files.catbox.moe/jkkxrw.mp4",
      7: "https://files.catbox.moe/trar7f.mp4",
      8: "https://files.catbox.moe/8a59d9.mp4"
    };

    // If no argument is passed, display episode list & instructions
    if (!args[0]) {
      return api.sendMessage(
        "🏮OVERFLOW ANIME SERIES🏮\n" +
        "━━━━━━━━━━━━━━━━━━━━━\n" +
        "📌 Available Episodes: 1 to 8\n\n" +
        "📝 How to watch:\n" +
        "• !overall ep 1\n" +
        "• !over 2\n" +
        "• !overall ep 5\n" +
        "━━━━━━━━━━━━━━━━━━━━━\n" +
        "👤 Author: DI-ABLO ",
        event.threadID,
        event.messageID
      );
    }

    // Parse requested episode number (e.g. "ep 1", "ep1", or "1")
    let epInput = args.join(" ").toLowerCase().replace("ep", "").trim();
    let epNum = parseInt(epInput);

    if (isNaN(epNum) || !animeEpisodes[epNum]) {
      return api.sendMessage(
        "❌ Invalid episode number! Please choose an episode between 1 and 8.\n" +
        "Example: !overall ep 1",
        event.threadID,
        event.messageID
      );
    }

    // 🎬 Loading Reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("🎬", event.messageID, (err) => {}, true);
    }

    const videoUrl = animeEpisodes[epNum];
    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `overall_ep${epNum}_${Date.now()}.mp4`);

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios({
        method: "GET",
        url: videoUrl,
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
          body: `🍿 [ OVERALL ANIME ]\n\n🎬 Episode: ${epNum} / 8\n👤 Author: DI-ABLO 🗿`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => {
          // 🔥 Success Reaction
          if (api && typeof api.setMessageReaction === "function") {
            api.setMessageReaction("🔥", event.messageID, (err) => {}, true);
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
      api.sendMessage(`❌ Episode ${epNum} ভিডিও পাঠাতে সমস্যা হয়েছে!`, event.threadID, event.messageID);
    }
  }
};
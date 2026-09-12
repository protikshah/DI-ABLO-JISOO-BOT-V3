const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "prefix",
    version: "2.4",
    author: "DI-AB-LO",
    countDown: 5,
    role: 0,
    description: "📌 show bot prefix & info with a random video",
    category: "config",
    guide: {
      en: "{pn} - show prefix & info\n{pn} <new prefix> - change prefix\n{pn} reset - reset to default"
    }
  },

  onStart: async function ({ api, event, args, message, threadsData }) {
    const { senderID, threadID, messageID } = event;

    // ---- CHANGE PREFIX ----
    if (args[0] && args[0].toLowerCase() !== "reset") {
      const newPrefix = args[0];
      await threadsData.set(threadID, newPrefix, "data.prefix");
      return message.reply(`✅ Prefix changed to: ${newPrefix}`);
    }

    if (args[0] && args[0].toLowerCase() === "reset") {
      await threadsData.set(threadID, null, "data.prefix");
      return message.reply(`🔄 Prefix reset to default: ${global.GoatBot.config.prefix}`);
    }

    // ---- GET USER NAME ----
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      userName = userInfo[senderID]?.name || "User";
    } catch (e) {}

    // ---- SYSTEM & CHAT PREFIX ----
    const systemPrefix = global.GoatBot.config.prefix || "!";
    const chatPrefix = (await threadsData.get(threadID, "data.prefix")) || systemPrefix;

    // ---- RANDOM VIDEO ----
    const videoLinks = [
      "https://files.catbox.moe/w6rysj.mp4",
      "https://files.catbox.moe/72nxwm.mp4",
      "https://files.catbox.moe/jv18pw.mp4",
      "https://files.catbox.moe/qxqzma.mp4",
      "https://files.catbox.moe/8ixpzv.mp4"
    ];
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];

    // ---- DOWNLOAD VIDEO ----
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const videoPath = path.join(cacheDir, `prefix_${Date.now()}.mp4`);
    try {
      const response = await axios({
        method: "GET",
        url: randomVideo,
        responseType: "stream",
        timeout: 30000
      });
      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
        response.data.on("error", reject);
      });
    } catch (err) {
      console.error("Video download error:", err);
    }

    // ---- CREATE SIMPLE BOX ----
    const width = 30;
    const line = "─".repeat(width);
    const top = `╭${line}╮`;
    const mid = `├${line}┤`;
    const bot = `╰${line}╯`;

    // Helper: pad text to exact width
    const pad = (text, len = width) => {
      const clean = text.replace(/[^\x00-\x7F]/g, ''); // remove emojis
      const currentLen = clean.length;
      if (currentLen >= len) return text.slice(0, len);
      return text + " ".repeat(len - currentLen);
    };

    // Prepare content
    const sys = systemPrefix.slice(0, 8);
    const chat = chatPrefix.slice(0, 8);
    const name = userName.slice(0, 14);

    const lines = [
      top,
      `│ ${pad("PREFIX INFO")} │`,
      mid,
      `│ ${pad("🌐 System: " + sys)} │`,
      `│ ${pad("🛸 Your: " + chat)} │`,
      mid,
      `│ ${pad("👤 User: " + name)} │`,
      mid,
      `│ ${pad("💡 Type: " + chat + "help")} │`,
      `│ ${pad("💡 Change: " + chat + "prefix <s>")} │`,
      `│ ${pad("💡 Reset: " + chat + "prefix reset")} │`,
      bot
    ];

    const msg = lines.join("\n");

    // ---- SEND ----
    const attachment = fs.existsSync(videoPath) ? fs.createReadStream(videoPath) : null;

    await api.sendMessage(
      {
        body: msg,
        attachment: attachment
      },
      threadID,
      (err) => {
        if (err) console.error("Send error:", err);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      },
      messageID
    );
  }
}
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");
const ytSearch = require("yt-search");
const axios = require("axios");

const ytdlpPath = path.join(__dirname, "yt-dlp.exe");

module.exports = {
  config: {
    name: "video",
    aliases: ["play", "yt", "gaan"],
    version: "16.0.0",
    author: "protik shah",
    countDown: 15,
    role: 0,
    shortDescription: "search & download video (-v) or audio (-a) from youtube",
    category: "media",
    guide: {
      en: "{p}video -v <song name>\n{p}video -a <song name>\nThen reply with a number (1-5) to pick."
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (args.length === 0) {
      return api.sendMessage(
        "❌ Please provide a song name.\n\n💡 Usage:\n-v <song name> (video)\n-a <song name> (audio only)",
        threadID, messageID
      );
    }

    let isAudioOnly = false;
    let query = args.join(" ");

    if (args[0] === "-a" || args[0] === "--audio") {
      isAudioOnly = true;
      query = args.slice(1).join(" ");
    } else if (args[0] === "-v" || args[0] === "--video") {
      isAudioOnly = false;
      query = args.slice(1).join(" ");
    }

    if (!query) return api.sendMessage("❌ Please provide a song name.", threadID, messageID);

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const searchResults = await ytSearch(query);
      if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      const topResults = searchResults.videos.slice(0, 5);

      // Download thumbnails to temp cache so we can attach them
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const thumbPaths = [];
      for (let i = 0; i < topResults.length; i++) {
        try {
          const thumbUrl = topResults[i].thumbnail;
          const thumbPath = path.join(cacheDir, `thumb_${Date.now()}_${i}.jpg`);
          const response = await axios.get(thumbUrl, { responseType: "arraybuffer" });
          await fs.writeFile(thumbPath, response.data);
          thumbPaths.push(thumbPath);
        } catch (e) {
          console.error("Thumbnail download error:", e.message);
        }
      }

      let listText = `🔍 Results for: ${query}\n\n`;
      topResults.forEach((v, i) => {
        listText += `${i + 1}. ${v.title}\n⏱️ ${v.timestamp} | 👤 ${v.author.name}\n\n`;
      });
      listText += `👉 Reply with a number (1-${topResults.length}) to download as ${isAudioOnly ? "AUDIO" : "VIDEO"}.`;

      const attachments = thumbPaths.map(p => fs.createReadStream(p));

      api.sendMessage(
        {
          body: listText,
          attachment: attachments.length > 0 ? attachments : undefined
        },
        threadID,
        (err, info) => {
          // Clean up thumbnail files after sending
          thumbPaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });

          if (err) {
            console.error("Send list error:", err);
            return;
          }

          // Register the reply listener
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: senderID,
            results: topResults,
            isAudioOnly: isAudioOnly
          });
        },
        messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error("Video Search Error:", err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: ${err.message || "Something went wrong"}`, threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;

    // Only the person who searched can pick
    if (senderID !== Reply.author) return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) {
      return api.sendMessage(`❌ Please reply with a number between 1 and ${Reply.results.length}.`, threadID, messageID);
    }

    const selectedVideo = Reply.results[choice - 1];
    const videoUrl = selectedVideo.url;
    const title = selectedVideo.title;
    const isAudioOnly = Reply.isAudioOnly;

    api.setMessageReaction("⏳", messageID, () => {}, true);
    api.sendMessage(`⬇️ Downloading ${isAudioOnly ? "audio" : "video"}: ${title}`, threadID);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const outputTemplate = path.join(cacheDir, `yt_${Date.now()}.%(ext)s`);

    const ytArgs = [
      videoUrl,
      "--no-playlist",
      "--ffmpeg-location", __dirname,
      "-o", outputTemplate,
      "--print", "after_move:filepath"
    ];

    if (isAudioOnly) {
      ytArgs.push("-x", "--audio-format", "mp3");
    } else {
      ytArgs.push(
        "-f", "bestvideo[height<=480]+bestaudio/best[height<=480]",
        "--merge-output-format", "mp4"
      );
    }

    let finalPath = null;
    let errorOutput = "";

    const proc = spawn(ytdlpPath, ytArgs);

    proc.stdout.on("data", (data) => {
      const text = data.toString().trim();
      if (text) finalPath = text;
    });

    proc.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    proc.on("close", async (code) => {
      try {
        if (code !== 0 || !finalPath || !fs.existsSync(finalPath)) {
          console.error("yt-dlp error output:", errorOutput);
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("❌ Error: ডাউনলোড করতে ব্যর্থ হয়েছে।", threadID);
        }

        const fileSize = (await fs.stat(finalPath)).size;
        if (fileSize > 25 * 1024 * 1024) {
          await fs.unlink(finalPath);
          api.setMessageReaction("📏", messageID, () => {}, true);
          return api.sendMessage("❌ File too large (>25MB). Try a shorter video.", threadID);
        }

        const attachment = fs.createReadStream(finalPath);
        const msg = isAudioOnly
          ? `🎻✓ your Searching music ✔\n🎷☞«❮ ${title}`
          : `🎻✓ your Searching video ✔\n🎷☞«❮ ${title}`;

        await api.sendMessage({
          body: msg,
          attachment: attachment
        }, threadID, (err) => {
          if (err) console.error("Send error:", err);
          if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
        });

        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (err) {
        console.error("Reply Download Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ Error: ${err.message || "Something went wrong"}`, threadID);
      }
    });
  }
};
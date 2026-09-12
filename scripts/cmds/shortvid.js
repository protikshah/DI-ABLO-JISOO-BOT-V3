const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");
const ytSearch = require("yt-search");

const ytdlpPath = path.join(__dirname, "yt-dlp.exe");
const historyFile = path.join(__dirname, "cache", "shortvid_history.json");

module.exports = {
  config: {
    name: "shortvid",
    aliases: ["sv", "myvid"],
    version: "2.0.0",
    author: "protik shah",
    countDown: 15,
    role: 0,
    shortDescription: "random short clip (max 60s) of a character/topic",
    category: "media",
    guide: {
      en: "{p}shortvid <character/topic name>\nExample: {p}shortvid gojo"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    const name = args.join(" ").trim();
    if (!name) {
      return api.sendMessage("❌ Please provide a name.\n💡 Example: shortvid gojo", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const history = await loadHistory();
      const key = `${senderID}_${name.toLowerCase()}`;
      const seenIds = history[key] || [];

      // Multiple query variations to widen the search pool
      const queries = [
        `${name}`,
        `${name} shorts`,
        `${name} status`,
        `${name} edit`,
        `${name} whatsapp status`
      ];

      const searchPromises = queries.map(q => ytSearch(q).catch(() => null));
      const results = await Promise.all(searchPromises);

      // Merge all videos from all queries, removing duplicates by videoId
      const videoMap = new Map();
      for (const res of results) {
        if (!res || !res.videos) continue;
        for (const v of res.videos) {
          if (!videoMap.has(v.videoId)) {
            videoMap.set(v.videoId, v);
          }
        }
      }

      const allVideos = Array.from(videoMap.values());

      if (allVideos.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ No results found. অন্য বানানে বা ইংরেজি নামে চেষ্টা কর।", threadID, messageID);
      }

      // Only keep videos that are 60 seconds or shorter (and valid duration)
      const shortVideos = allVideos.filter(v => v.seconds > 0 && v.seconds <= 60);

      if (shortVideos.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ কোনো ৬০ সেকেন্ডের কম ভিডিও পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা কর।", threadID, messageID);
      }

      // Exclude videos already sent before to this user for this topic
      let freshVideos = shortVideos.filter(v => !seenIds.includes(v.videoId));

      // If everything has already been shown before, reset history for this topic and reuse full pool
      if (freshVideos.length === 0) {
        freshVideos = shortVideos;
        history[key] = [];
      }

      const picked = freshVideos[Math.floor(Math.random() * freshVideos.length)];
      const videoUrl = picked.url;
      const title = picked.title;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const outputTemplate = path.join(cacheDir, `sv_${Date.now()}.%(ext)s`);

      const ytArgs = [
        videoUrl,
        "--no-playlist",
        "--ffmpeg-location", __dirname,
        "--match-filter", "duration < 60",
        "-f", "bestvideo[height<=480]+bestaudio/best[height<=480]",
        "--merge-output-format", "mp4",
        "-o", outputTemplate,
        "--print", "after_move:filepath"
      ];

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
            return api.sendMessage("❌ Error: ডাউনলোড করতে ব্যর্থ হয়েছে। আবার ট্রাই কর।", threadID, messageID);
          }

          const fileSize = (await fs.stat(finalPath)).size;
          if (fileSize > 25 * 1024 * 1024) {
            await fs.unlink(finalPath);
            api.setMessageReaction("📏", messageID, () => {}, true);
            return api.sendMessage("❌ File too large (>25MB).", threadID, messageID);
          }

          const attachment = fs.createReadStream(finalPath);
          await api.sendMessage({
            body: `🎬 ${title}`,
            attachment: attachment
          }, threadID, (err) => {
            if (err) console.error("Send error:", err);
            if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
          }, messageID);

          // Update history: add this video, keep only last 30
          const updatedSeen = [...(history[key] || []), picked.videoId];
          history[key] = updatedSeen.slice(-30);
          await saveHistory(history);

          api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (err) {
          console.error("Shortvid Command Error:", err);
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage(`❌ Error: ${err.message || "Something went wrong"}`, threadID, messageID);
        }
      });

    } catch (err) {
      console.error("Shortvid Search Error:", err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: ${err.message || "Something went wrong"}`, threadID, messageID);
    }
  }
};

// ---------- History helpers ----------

async function loadHistory() {
  try {
    await fs.ensureDir(path.dirname(historyFile));
    if (!(await fs.pathExists(historyFile))) {
      await fs.writeJson(historyFile, {});
      return {};
    }
    return await fs.readJson(historyFile);
  } catch (e) {
    console.error("loadHistory error:", e.message);
    return {};
  }
}

async function saveHistory(data) {
  try {
    await fs.writeJson(historyFile, data, { spaces: 2 });
  } catch (e) {
    console.error("saveHistory error:", e.message);
  }
}
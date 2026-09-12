const fs = require("fs-extra");
const path = require("path");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

// ❤️ Only FEMALE, romantic voices
const VOICES = {
  bn: "bn-BD-NabanitaNeural",    // Bengali (Bangladesh) - Female, soft
  en: "en-US-AriaNeural",        // English (US) - Female, warm
  hi: "hi-IN-SwaraNeural"        // Hindi (India) - Female, sweet
};

// Detect language from text
function detectLanguage(text) {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en"; // default English
}

module.exports = {
  config: {
    name: "sayit",
    aliases: ["voice11", "gftts"],
    version: "3.0.0",
    author: "protik shah",
    countDown: 8,
    role: 0,
    shortDescription: "💕 romantic voice message (auto detects Bangla/English/Hindi)",
    category: "fun",
    guide: {
      en: "{pn} <text> - auto detect language\n"
        + "{pn} -v bn <text> - force Bangla\n"
        + "{pn} -v en <text> - force English\n"
        + "{pn} -v hi <text> - force Hindi"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    let text = args.join(" ").trim();
    let forcedLang = null;

    // Check for voice override: -v bn, -v en, -v hi
    if (args[0] === "-v" && args[1] && VOICES[args[1]]) {
      forcedLang = args[1];
      text = args.slice(2).join(" ").trim();
    }

    if (!text) {
      return api.sendMessage(
        "💕 Please provide text to speak.\n\n"
        + "✨ Usage:\n"
        + "• {p}sayit <text> (auto detects Bangla/English/Hindi)\n"
        + "• {p}sayit -v bn <text> (force Bangla)\n"
        + "• {p}sayit -v en <text> (force English)\n"
        + "• {p}sayit -v hi <text> (force Hindi)",
        threadID,
        messageID
      );
    }

    if (text.length > 300) {
      return api.sendMessage("❌ Text too long. Keep it under 300 characters.", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const outputPath = path.join(cacheDir, `voice_${Date.now()}.mp3`);

    try {
      const tts = new MsEdgeTTS();

      // Determine voice: forced or auto-detect
      let lang = forcedLang || detectLanguage(text);
      let voice = VOICES[lang] || VOICES.en;

      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      // 💕 Romantic settings: slow + soft + sweet pitch
      const { audioStream } = await tts.toStream(text, {
        rate: "-18%",   // slightly slow (romantic feel)
        pitch: "+8%"    // soft, feminine tone
      });

      const writeStream = fs.createWriteStream(outputPath);

      await new Promise((resolve, reject) => {
        audioStream.pipe(writeStream);
        audioStream.on("error", reject);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      if (!fs.existsSync(outputPath) || (await fs.stat(outputPath)).size === 0) {
        throw new Error("Audio file was not generated properly.");
      }

      const voiceEmoji = lang === "bn" ? "💕" : lang === "hi" ? "💖" : "💗";

      await api.sendMessage({
        body: `${voiceEmoji} [ ${lang.toUpperCase()} VOICE ]`,
        attachment: fs.createReadStream(outputPath)
      }, threadID, (err) => {
        if (err) console.error("Send error:", err);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, messageID);

      api.setMessageReaction("❤️", messageID, () => {}, true);

    } catch (err) {
      console.error("Sayit Error:", err);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      api.setMessageReaction("❌", messageID, () => {}, true);

      let errorMsg = `❌ Error: ${err.message || "Voice generation failed"}\n\n`;
      errorMsg += "💡 Try using a different voice:\n"
        + "• {p}sayit -v bn <text>\n"
        + "• {p}sayit -v en <text>\n"
        + "• {p}sayit -v hi <text>";

      return api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};
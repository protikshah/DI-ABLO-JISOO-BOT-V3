const axios = require("axios");

// এখানে তোর Gemini API key বসা
const GEMINI_API_KEY = "AQ.Ab8RN6Ipai2hLWE2WeJr9OPZW0Dn0SCuReZaNNmXQ8bjjjsDTg";

module.exports = {
  config: {
    name: "groupmood",
    aliases: ["mood", "vibe"],
    version: "1.0.0",
    author: "protik shah",
    countDown: 30,
    role: 0,
    shortDescription: "analyze the group's current mood using AI",
    category: "fun",
    guide: {
      en: "{p}groupmood"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("তোর_আসল")) {
      return api.sendMessage("❌ Gemini API key সেট করা হয়নি। groupmood.js ফাইলে API key বসাও।", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const history = await new Promise((resolve, reject) => {
        api.getThreadHistory(threadID, 60, undefined, (err, data) => {
          if (err) return reject(err);
          resolve(data);
        });
      });

      if (!history || history.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ যথেষ্ট মেসেজ পাওয়া যায়নি।", threadID, messageID);
      }

      const transcript = history
        .filter(m => m.body && m.body.trim().length > 0)
        .map(m => m.body)
        .slice(-60)
        .join("\n");

      if (!transcript) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ বিশ্লেষণ করার মতো টেক্সট মেসেজ পাওয়া যায়নি।", threadID, messageID);
      }

      const prompt = `নিচে একটা Messenger গ্রুপের সাম্প্রতিক কিছু মেসেজ (নাম ছাড়া, শুধু টেক্সট) দেওয়া হলো। এই কথোপকথনের সামগ্রিক "mood" বাংলায় ২-৩ লাইনে মজা করে বলো (হাসিখুশি/ঝগড়া/রোমান্টিক/চুপচাপ/উত্তেজনাপূর্ণ ইত্যাদির মধ্যে যেটা মানানসই)। শুরুতে একটা emoji দাও।\n\nমেসেজসমূহ:\n${transcript}`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি।");

      api.sendMessage(`📊 গ্রুপ মুড রিপোর্ট:\n\n${aiText.trim()}`, threadID, messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error("Groupmood Error:", err?.response?.data || err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: ${err.message || "কিছু ভুল হয়েছে"}`, threadID, messageID);
    }
  }
};
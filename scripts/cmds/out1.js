module.exports = {
  config: {
    name: "out1",
    aliases: ["dbbjbjbbjbj", "lehhvhvhve122S"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 0,
    role: 2, // Admin only role
    shortDescription: "Make bot leave the group chat",
    category: "admin",
    guide: { en: "{p}out or {p}di-ab-.lo" }
  },

  adminUIDs: ["100073798820230"], 

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    if (!this.adminUIDs.includes(senderID)) {
      return sendMsg("❌ ᴏɴʟʏ ᴍʏ ʙᴏss ᴅɪ-ᴀʙʟᴏ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!");
    }

    try {
      await sendMsg("👋 ɢᴏᴏᴅʙʏᴇ ᴇᴠᴇʀʏᴏɴᴇ! ᴅɪ-ᴀʙʟᴏ ʜᴀs ᴏʀᴅᴇʀᴇᴅ ᴍᴇ ᴛᴏ ʟᴇᴀᴠᴇ ᴛʜɪs ɢʀᴏᴜᴘ.");
      
      // ২ সেকেন্ড ওয়েট করে লিভ নিবে যাতে মেসেজটা সবাই দেখতে পায়
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), event.threadID, (err) => {
          if (err) console.error("Failed to leave group:", err);
        });
      }, 2000);

    } catch (err) {
      console.error(err);
      return sendMsg("❌ ғᴀɪʟᴇᴅ ᴛᴏ ʟᴇᴀᴠᴇ ᴛʜᴇ ɢʀᴏᴜᴘ.");
    }
  }
};

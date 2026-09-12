module.exports = {
  config: {
    name: "sendmsg",
    aliases: ["notee2i", "broadcast", "announcement"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 5,
    role: 2, // Admin only
    shortDescription: "Send notification message to all groups",
    category: "admin",
    guide: { en: "{p}sendmsg [text] OR {p}sendmsg [1/2/3...]" }
  },

  // jj
  adminUIDs: ["100073798820230"], 

  // ফাইলের ভেতরে তোর চয়েস করা প্রিসেট নোটিফিকেশন
  presetMessages: {
    "1": "📢 ─── [ ʙᴏᴛ ᴜᴘᴅᴀᴛᴇ ] ─── 📢\n\nহ্যালো গাইস! বটের নতুন সব ফিচার ও গেম এড করা হয়েছে। এখন থেকে ট্রাই করো #slot, #toss, #dice, #rps, #hilow!",
    "2": "⚠️ ─── [ sᴇʀᴠᴇʀ ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ ] ─── ⚠️\n\nবট সার্ভার আপগ্রেড করা হচ্ছে। কিছুক্ষণের জন্য সেবা ব্যাহত হতে পারে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।",
    "3": "🎉 ─── [ ᴇᴠᴇɴᴛ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ ] ─── 🎉\n\nআমাদের বটের স্পেশাল ইভেন্ট চালু হয়েছে! এখনই  ᴅɪ-ᴀʙʟᴏ BANK লোনের সুযোগ নাও আর গেমে অংশগ্রহণ করো!"
  },

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    // সিকিউরিটি চেক: শুধু তুই কমান্ড ব্যবহার করতে পারবি
    if (!this.adminUIDs.includes(senderID)) {
      return sendMsg("❌ ᴏɴʟʏ ᴍʏ ʙᴏss ᴅɪ-ᴀʙʟᴏ ᴄᴀɴ sᴇɴᴅ ɢʟᴏʙᴀʟ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs!");
    }

    if (!args[0]) {
      return sendMsg("❌ ᴜsᴀɢᴇ:\n1️⃣ #sendmsg [তোর কাস্টম মেসেজ]\n2️⃣ #sendmsg 1 (প্রিসেট মেসেজ ১)\n3️⃣ #sendmsg 2 (প্রিসেট মেসেজ ২)");
    }

    // মেসেজ ফিল্টার করা (প্রিসেট নাকি কাস্টম)
    let finalMessage = "";
    if (this.presetMessages[args[0]]) {
      finalMessage = this.presetMessages[args[0]];
    } else {
      finalMessage = `📢 ─── [ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ] ─── 📢\n\n${args.join(" ")}\n\n👤 — ᴍᴇssᴀɢᴇ ғʀᴏᴍ ᴅɪ-ᴀʙʟᴏ`;
    }

    try {
      // বটের সব থ্রেড/গ্রুপ আইডি সংগ্রহ করা
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threadList.filter(thread => thread.isGroup && thread.threadID !== event.threadID);

      let successCount = 0;
      let failCount = 0;

      await sendMsg(`⏳ sᴇɴᴅɪɴɢ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ᴛᴏ ${groupThreads.length} ɢʀᴏᴜᴘs...`);

      for (const group of groupThreads) {
        try {
          await api.sendMessage(finalMessage, group.threadID);
          successCount++;
          // স্প্যাম ব্লক এড়াতে ৩০০ মিলি-সেকেন্ড গ্যাপ
          await new Promise(resolve => setTimeout(resolve, 300)); 
        } catch (err) {
          failCount++;
        }
      }

      return sendMsg(`✅ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ sᴇɴᴛ sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n🎯 sᴜᴄᴄᴇss: ${successCount} ɢʀᴏᴜᴘs\n❌ ғᴀɪʟᴇᴅ: ${failCount} ɢʀᴏᴜᴘs`);

    } catch (err) {
      console.error(err);
      return sendMsg("❌ ғᴀɪʟᴇᴅ ᴛᴏ sᴇɴᴅ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs.");
    }
  }
};
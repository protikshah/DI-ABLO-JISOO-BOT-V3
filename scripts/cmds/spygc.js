const axios = require("axios");

module.exports = {
  config: {
    name: "spygc",
    version: "3.0",
    author: "ARIYAN AHMED", // তোমার নাম আপডেট করা হয়েছে
    countDown: 5,
    role: 2,
    shortDescription: "Spy, Join, or Leave group chats.",
    longDescription: "বট যেসব গ্রুপে আছে সেগুলোর লিস্ট দেখাবে। রিপ্লাই দিয়ে আপনি গ্রুপে জয়েন করতে পারেন অথবা বটকে লিভ করাতে পারেন।",
    category: "admin",
    guide: {
      en: "{p}spygc\nReply: <number> join (নিজেকে অ্যাড করতে)\nReply: <number> leave (বটকে লিভ করাতে)",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      // ২০টি গ্রুপের লিস্ট নেওয়া হবে
      const list = await api.getThreadList(20, null, ['INBOX']);
      const groupList = list.filter(group => group.threadName !== null && group.isGroup);

      if (groupList.length === 0) {
        return api.sendMessage('❌ 𝖭𝗈 𝗀𝗋𝗈𝗎𝗉 𝖼𝗁𝖺𝗍𝗌 𝖿𝗈𝗎𝗇𝖽.', event.threadID);
      }

      let msg = "╭━━━〔 𝐒𝐏𝐘 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃 〕━━🌀\n┃\n";
      groupList.forEach((group, index) => {
        msg += `┃ ${index + 1}. ${group.threadName}\n┃ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${group.participantIDs.length}\n┃ 🆔 𝗧𝗜𝗗: ${group.threadID}\n┃━━━━━━━━━━━━━━━━━━\n`;
      });
      msg += "╰━━━━━━〔 𝐀𝐑𝐈𝐘𝐀𝐍 𝐀𝐈 〕━━━🌀\n\n💡 𝗥𝗲𝗽𝗹𝘆 𝗘𝘅𝗮𝗺𝗽𝗹𝗲:\n'1 join' - নিজেকে অ্যাড করতে\n'1 leave' - বটকে বের করতে";

      const sendMsg = await api.sendMessage(msg, event.threadID);
      global.GoatBot.onReply.set(sendMsg.messageID, {
        commandName: 'spygc',
        author: event.senderID,
        groupList: groupList,
      });
    } catch (err) {
      api.sendMessage("❌ 𝖤𝗋𝗋𝗈𝗋 𝖿𝖾𝗍𝖼𝗁𝗂𝗇𝗀 𝗀𝗋𝗈𝗎𝗉 𝗅𝗂𝗌𝗍.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, groupList } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(args[0]);
    const action = args[1]?.toLowerCase();

    if (isNaN(index) || index <= 0 || index > groupList.length) {
      return api.sendMessage('⚠️ 𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝗇𝗎𝗆𝖻𝖾𝗋!', event.threadID, event.messageID);
    }

    const targetGroup = groupList[index - 1];

    // --- JOIN ACTION ---
    if (action === "join") {
      try {
        await api.addUserToGroup(author, targetGroup.threadID);
        api.sendMessage(`✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀! 𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗮𝗱𝗱𝗲𝗱 𝘁𝗼: ${targetGroup.threadName}`, event.threadID);
      } catch (e) {
        api.sendMessage(`❌ 𝗖𝗮𝗻'𝘁 𝗮𝗱𝗱 𝘆𝗼𝘂. 𝗠𝗮𝘆𝗯𝗲 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝗲 𝗶𝘀 𝗢𝗡!`, event.threadID);
      }
    } 
    // --- LEAVE ACTION ---
    else if (action === "leave") {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), targetGroup.threadID);
        api.sendMessage(`✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀! 𝗕𝗼𝘁 𝗵𝗮𝘀 𝗹𝗲𝗳𝘁: ${targetGroup.threadName}`, event.threadID);
      } catch (e) {
        api.sendMessage(`❌ 𝖥𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗅𝖾𝖺𝗏𝖾 𝗍𝗁𝖾 𝗀𝗋𝗈𝗎𝗉.`, event.threadID);
      }
    } 
    else {
      api.sendMessage("⚠️ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗌𝗉𝖾𝖼𝗂𝖿𝗒 'join' 𝗈𝗋 'leave'.\n𝖤𝗑: '1 join'", event.threadID);
    }
    
    global.GoatBot.onReply.delete(Reply.messageID);
  }
};
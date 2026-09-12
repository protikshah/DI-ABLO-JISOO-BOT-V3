module.exports = {
  config: {
    name: "rate",
    aliases: ["rate"],
    version: "1.2",
    author: "Sazzad",
    countDown: 5,
    role: 0,
    shortDescription: "Ke koto % cute/pocha",
    longDescription: "Mention ba reply diye karo rating check koro",
    category: "fun",
    guide: {
      en: "{p}rate [@mention / reply]\nEx: {p}rate @user"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function"
? message.reply(txt)
      : api.sendMessage(txt, event.threadID, event.messageID);

    let targetID = event.senderID;
    let targetName = await usersData.getName(targetID);

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      targetName = await usersData.getName(targetID);
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      targetName = await usersData.getName(targetID);
    }

    const specialID = "61587127840501";
    let percent;

    if (targetID === specialID) {
      percent = (Math.random() * 20 + 80).toFixed(2); // 80.00 - 100.00
    } else {
      percent = (Math.random() * 99 + 1).toFixed(2); // 1 - 100
    }

    percent = parseFloat(percent);
    let result = "";
    if (percent < 20) result = "💀 bhai mukh dho age";
    else if (percent < 40) result = "😬 cholbe arki";
    else if (percent < 60) result = "😏 average cute";
    else if (percent < 80) result = "😍 onek cute tumi";
    else result = "✨ LEGENDARY CUTE LEVEL";

    return sendMsg(
`⭐ ─── [ RATING TESTER ] ─── ⭐
👤 Target: ${targetName}
📊 Cute %: ${percent}%
${result}`
    );
  }
};
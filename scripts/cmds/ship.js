module.exports = {
  config: {
    name: "ship",
    aliases: ["ship", "couple"],
    version: "v1.0",
    author: "Sazzad",
    countDown: 5,
    role: 0,
    shortDescription: "2 jon er love % check koro",
    longDescription: "2 jon ke mention diye ship koro",
    category: "fun",
    guide: {
      en: "{p}ship @user1 @user2"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function"? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    let mentions = Object.keys(event.mentions || {});
    let targetID1, targetID2;
    let name1, name2;

    if (mentions.length >= 2) {
      targetID1 = mentions[0];
      targetID2 = mentions[1];
    } else if (mentions.length === 1 && event.type === "message_reply") {
      targetID1 = mentions[0];
      targetID2 = event.messageReply.senderID;
    } else {
      return sendMsg("2 jon ke mention de ba 1 jon ke mention + 1 jon ke reply de 😒\nEx: #ship @user1 @user2");
    }

    name1 = await usersData.getName(targetID1);
    name2 = await usersData.getName(targetID2);

    // Random % but same pair always same result
    const seed = targetID1 + targetID2;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const percent = Math.abs(hash % 100) + 1;

    const coupleName = name1.slice(0, Math.ceil(name1.length/2)) + name2.slice(Math.floor(name2.length/2));

    let status = "";
    if (percent < 20) status = "💔 Dure thako vai bon";
    else if (percent < 40) status = "😅 ektu crush crush vab";
    else if (percent < 60) status = "😳 valoi manabe re";
    else if (percent < 80) status = "🥰 perfect couple";
    else status = "💍 biye kore felo bhai";

    const loveBars = "❤️".repeat(Math.floor(percent/10)) + "🖤".repeat(10 - Math.floor(percent/10));

    return sendMsg(
`@${name1} x @${name2}

💘 Love Meter: ${percent}%
${loveBars}

Couple Name: ${coupleName}
${status}`
    );
  }
};
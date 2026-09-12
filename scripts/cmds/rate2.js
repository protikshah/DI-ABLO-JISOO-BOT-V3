const rateComments = {
1: ["Ekdom baje 🤮", "0/10. Improve koro", "Ei na hoileo parto"],
2: ["Baje obostha 💀", "Ar ektu try koro", "1/10"],
3: ["Cholbe ar ki 😅", "Average er o niche", "Motamoti"],
4: ["Thik ache 😑", "Not bad", "Cholbe"],
5: ["Average 😐", "50/50", "Majhamajhi"],
6: ["Valoi 😊", "Notun valo", "6/10 pass"],
7: ["Shundor 🔥", "Valo lagse", "Keep it up"],
8: ["Agni 🔥🔥", "Shei hoise", "Impressive"],
9: ["Ekdom sera 💯", "Pro level", "Respect bhai"],
10: ["GOAT 🐐", "Perfect 10/10", "King/Queen"]
};

module.exports = {
config: {
name: "rate2",
aliases: ["rt", "rating"],
version: "2.0.0",
author: "Sazzad",
countDown: 3,
role: 0,
shortDescription: "Rate anything 1-10",
category: "FUN"
},
onStart: async function ({ api, event, args, message }) {
const sendMsg = (txt) => message && typeof message.reply === "function"? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

let target = args.join(" ") || "Tumi";
let rate = Math.floor(Math.random() * 11); // 0-10

// jodi 0 ashe tahole 1 theke suru koro
if(rate == 0) rate = Math.floor(Math.random() * 10) + 1;

let commentList = rateComments;
let comment = commentList[Math.floor(Math.random() * commentList.length)];

// emoji bar
let bar = "";
for(let i=1; i<=10; i++){
  bar += i <= rate? "⭐" : "☆";
}

return sendMsg(`⭐ RATE CARD ⭐\n\nTarget: ${target}\nRating: ${rate}/10\n${bar}\n\nComment: ${comment}`);
}
};
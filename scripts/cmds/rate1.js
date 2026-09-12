module.exports = {
config: {
name: "rate1",
aliases: ["rt"],
version: "3.0.0",
author: "Sazzad",
countDown: 3,
role: 0,
shortDescription: "Rate anything",
category: "FUN"
},
onStart: async function ({ api, event, args, message }) {
const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

let target = args.join(" ") || "Tumi";
let rate = Math.floor(Math.random() * 10) + 1;

let comments = [
"Ekdom baje 🤮",
"Baje obostha 💀",
"Cholbe ar ki 😅",
"Thik ache 😑",
"Average 😐",
"Valoi 😊",
"Shundor 🔥",
"Agni 🔥🔥",
"Sera 💯",
"GOAT 🐐"
];

let comment = comments[rate - 1];
let bar = "⭐".repeat(rate) + "☆".repeat(10 - rate);

return sendMsg(`⭐ RATE CARD ⭐\n\nTarget: ${target}\nRating: ${rate}/10\n${bar}\n\nComment: ${comment}`);
}
};
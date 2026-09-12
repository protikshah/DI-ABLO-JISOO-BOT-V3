function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

const shipResult = [
"Perfect match! Biye kore felo 😍",
"Valo chance ache 😉 Prem hoye jabe",
"Friend thakai valo bro 💔",
"Agni chemistry 🔥",
"Ekdom baje match. Dur e thako",
"Soulmate mone hocche ✨",
"Time waste koiro na",
"Crush o tomar kotha vabe maybe 👀",
"Match hoise kintu jhogra beshi hobe",
"Heaven made pair 💞"
];

module.exports = {
config: {
name: "ship1",
aliases: ["s1", "ship1"],
version: "2.0.0",
author: "Sazzad",
countDown: 3,
role: 0,
shortDescription: "Ship 1 or 2 people",
category: "FUN"
},
onStart: async function ({ api, event, args, message }) {
const sendMsg = (txt) => message && typeof message.reply === "function"? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

let p1 = args[0] || "Tumi";
let p2 = args[1];

if(!p2) {
  // jodi 1 ta nam dey
  const mention = Object.keys(event.mentions || {})[0];
  if(mention) {
    p2 = event.mentions[mention].replace("@", "");
  } else {
    p2 = "Crush"; // default crush
  }
}

let percent = Math.floor(Math.random() * 101);
let result = shuffle([...shipResult])[0];

let msg = `🚢 SHIP RESULT 🚢\n\n${p1.toUpperCase()} + ${p2.toUpperCase()}\n\nMatch: ${percent}%\n\n${result}`;

return sendMsg(msg);
}
};
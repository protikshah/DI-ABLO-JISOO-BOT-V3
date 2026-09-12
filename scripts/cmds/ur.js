module.exports = {
config: {
name: "unsendreact",
aliases: ["ur"],
version: "1.2",
author: "Sazzad",
countDown: 0,
role: 1,
shortDescription: "Reply #r on bot msg with angry react",
longDescription: "React 😠 on bot msg to make bot reply #r. Only for Sazzad",
category: "admin",
guide: { en: "React 😠 on bot message" }
},

onStart: async function() {},

onReaction: async function({ api, event }) {
const OWNER_ID = "61587127840501"
const TARGET_REACT = "😠"
const botID = api.getCurrentUserID()

if (event.userID !== OWNER_ID) return
if (event.reaction !== TARGET_REACT) return
if (event.senderID !== botID) return

try {
await api.sendMessage("#r", event.threadID, event.messageID)
} catch (e) {
await api.sendMessage("❌ 𝐂𝐚𝐧𝐭 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐚𝐠𝐞", event.threadID)
}
}
}
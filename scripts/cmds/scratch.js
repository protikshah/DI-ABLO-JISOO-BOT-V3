const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
userID: { type: String, required: true, unique: true },
balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
config: {
name: "scratch",
aliases: ["sc"],
version: "1.0",
author: "Sazzad",
countDown: 3,
role: 0,
shortDescription: "Scratch card game",
longDescription: "3 tar moddhe 1 ta prize khujo",
category: "game",
guide: { en: "{p}scratch 100m | {p}scratch all | {p}scratch max" }
},

formatMoney: function (num) {
if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "B";
if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
return num.toLocaleString();
},

parseBet: function(str, balance) {
str = str.toLowerCase().replace(/,/g, "");
if (str === "all") return Math.min(balance, 269000);
if (str === "max") return 269000;
if (str.includes("b")) return parseFloat(str) * 1000000000;
if (str.includes("m")) return parseFloat(str) * 1000000;
if (str.includes("k")) return parseFloat(str) * 1000;
return parseFloat(str);
},

onStart: async function ({ api, event, args, message }) {
const sendMsg = (txt) => message.reply(txt);
const userID = event.senderID;

let user = await BankUser.findOne({ userID });
if (!user) user = await BankUser.create({ userID, balance: 1000 });

let bet = 100000000;
if (args[0]) bet = this.parseBet(args[0], user.balance);

if (isNaN(bet)) return sendMsg(`❌ Thikmoto bet dao. Ex: #scratch 100m | #scratch all`);
if (bet < 100000) return sendMsg(`❌ Minimum bet 100,000,000`);
if (bet > 269000) return sendMsg(`❌ Max bet 269,000,000,000`);
if (user.balance < bet) return sendMsg(`💸 Balance kom! Tor balance: $${this.formatMoney(user.balance)}`);

user.balance -= bet;

const cards = ["⬛", "⬛", "⬛"];
const prizeIndex = Math.floor(Math.random() * 3);
let multiplier = 0;
let prizeName = "";

const roll = Math.random();
if (roll < 0.03) {
multiplier = 20;
prizeName = "𝐉𝐀𝐂𝐊𝐏𝐎𝐓";
cards[prizeIndex] = "👑";
} else if (roll < 0.13) {
multiplier = 5;
prizeName = "𝐁𝐈𝐆 𝐖𝐈𝐍";
cards[prizeIndex] = "💰";
} else if (roll < 0.33) {
multiplier = 2;
prizeName = "𝐒𝐌𝐀𝐋𝐋 𝐖𝐈𝐍";
cards[prizeIndex] = "🍒";
} else {
cards[prizeIndex] = "💀";
}

let payout = bet * multiplier;
user.balance += payout;
await user.save();

let result = "";
if (multiplier > 0) {
result = `🎉 ${prizeName}! ${multiplier}x 🎉`;
} else {
result = `💀 𝐍𝐎 𝐏𝐑𝐈𝐙𝐄 💀`;
}

return sendMsg( `🌌 ━━ 𝑺𝑨𝒁𝒁𝑨𝑫'𝑺 𝑺𝑪𝑹𝑨𝑻𝑪𝑯 ━━ 🌌
[ 1️⃣ ] [ 2️⃣ ] [ 3️⃣ ]
⬇️ 𝑺𝑪𝑹𝑨𝑻𝑪𝑯 ⬇️
[ ${cards[0]} ] [ ${cards[1]} ] [ ${cards[2]} ]

${result}
💰 𝐁𝐞𝐭: $${bet.toLocaleString()}
${multiplier > 0? `🟢 𝐖𝐨𝐧: +$${payout.toLocaleString()}` : `🔴 𝐋𝐨𝐬𝐬: -$${bet.toLocaleString()}`}
💳 𝐖𝐚𝐥𝐥𝐞𝐭: $${user.balance.toLocaleString()}` );
}
};
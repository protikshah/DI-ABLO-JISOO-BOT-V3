const mongoose = require("mongoose");
const bankUserSchema = new mongoose.Schema({
userID: { type: String, required: true, unique: true },
balance: { type: Number, default: 0 }
});
const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

let statsDB = {};

module.exports = {
config: {
name: "heist",
aliases: ["h"],
version: "1.1",
author: "Sazzad",
countDown: 5,
role: 0,
shortDescription: "Bank Heist",
longDescription: "Rob the bank before police arrives",
category: "game",
guide: { en: "{p}heist 50 | {p}heist all | {p}heist max" }
},

formatMoney: function (num) {
if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "B";
if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
if (num >= 1000) return (num / 1000).toFixed(2).replace(/\.00$/, "") + "K";
return num.toLocaleString();
},

parseBet: function(str, balance) {
str = str.toLowerCase().replace(/,/g, "");
if (str === "all") return Math.min(balance, 69000000);
if (str === "max") return 69000000;
if (str.includes("b")) return parseFloat(str) * 1000000;
if (str.includes("m")) return parseFloat(str) * 1000000;
if (str.includes("k")) return parseFloat(str) * 1000;
return parseFloat(str);
},

onStart: async function ({ api, event, args, message }) {
const sendMsg = (txt) => message.reply(txt);
const userID = event.senderID;

let user = await BankUser.findOne({ userID });
if (!user) user = await BankUser.create({ userID, balance: 1000 });

const now = Date.now();
const ONE_HOUR = 3600000;
const MAX_PLAY = 20;

if (!statsDB[userID]) statsDB[userID] = { plays: 0, playsLeft: MAX_PLAY, lastReset: now };
let stats = statsDB[userID];

if (now - stats.lastReset >= ONE_HOUR) {
stats.playsLeft = MAX_PLAY;
stats.lastReset = now;
}

if (stats.playsLeft <= 0) {
let msLeft = ONE_HOUR - (now - stats.lastReset);
let m = Math.floor(msLeft / 60000);
let s = Math.floor((msLeft % 60000) / 1000);
return sendMsg(`⏳ 𝐋𝐈𝐌𝐈𝐓 𝐄𝐍𝐃\n𝐘𝐨𝐮 𝐰𝐢𝐥 𝐠𝐞𝐭 20 𝐡𝐞𝐢𝐬𝐭𝐬 𝐚𝐠𝐚𝐢𝐧 𝐚𝐟𝐭𝐞𝐫 1𝐡𝐫\n🕒 𝐋𝐞𝐟𝐭: ${m}𝐦 ${s}𝐬`);
}

let bet = 50;
if (args[0]) bet = this.parseBet(args[0], user.balance);

if (isNaN(bet)) return sendMsg(`❌ Invalid bet. Ex: #heist 50 | #heist all`);
if (bet < 50) return sendMsg(`❌ Minimum bet 50`);
if (bet > 69000000) return sendMsg(`❌ Max bet 69,000,000,000`);
if (user.balance < bet) return sendMsg(`💸 Low balance! Your balance: $${this.formatMoney(user.balance)}`);

stats.plays++;
stats.playsLeft--;
user.balance -= bet;

let luck = Math.random();
let result = "";
let payout = 0;
let loot = bet * (Math.random() * 2 + 1);

if (luck < 0.25) {
result = `👮 𝐂𝐀𝐔𝐆𝐇𝐓 𝐁𝐘 𝐏𝐎𝐋𝐈𝐂𝐄!`;
} else if (luck < 0.55) {
result = `🚨 𝐀𝐋𝐀𝐑𝐌 𝐓𝐑𝐈𝐆𝐄𝐑𝐄𝐃! 𝐄𝐬𝐜𝐚𝐩𝐞𝐝 𝐰𝐢𝐭𝐡 𝐩𝐚𝐫𝐭𝐢𝐚𝐥 𝐥𝐨𝐨𝐭`;
payout = loot * 0.4;
user.balance += payout;
} else if (luck < 0.85) {
result = `💼 𝐒𝐔𝐂𝐂𝐄𝐒𝐒! 𝐁𝐚𝐧𝐤 𝐫𝐨𝐛𝐞𝐝`;
payout = loot;
user.balance += payout;
} else {
result = `🏆 𝐌𝐄𝐆𝐀 𝐇𝐄𝐈𝐒𝐓! 𝐕𝐚𝐮𝐥𝐭 𝐜𝐫𝐚𝐜𝐤𝐞𝐝`;
payout = loot * 2.5;
user.balance += payout;
}

await user.save();
const used = MAX_PLAY - stats.playsLeft;

return sendMsg( `🏦 ━━ 𝐒𝐀𝐙𝐙𝐀𝐃'𝐒 𝐇𝐄𝐈𝐒𝐓 ━━ 🏦
${result}
💰 𝐈𝐧𝐯𝐞𝐬𝐭𝐞𝐝: $${this.formatMoney(bet)}
${payout > 0? `🟢 𝐋𝐨𝐨𝐭: +$${this.formatMoney(payout)}` : `🔴 𝐋𝐨𝐬𝐭: -$${this.formatMoney(bet)}`}
💳 𝐖𝐚𝐥𝐞𝐭: $${this.formatMoney(user.balance)}
📊 𝐇𝐞𝐢𝐬𝐭𝐬: ${used}/20` );
}
};
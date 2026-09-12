const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
userID: { type: String, required: true, unique: true },
balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

let statsDB = {};

module.exports = {
config: {
name: "slot3",
aliases: ["s3", "spin"],
version: "5.3",
author: "Sazzad",
countDown: 5,
role: 0,
shortDescription: "Tier slot game",
longDescription: "Nice, Great, Jackpot",
category: "game",
guide: { en: "{p}slot3 100m | {p}slot3 all | {p}slot3 max" }
},

formatMoney: function (num) {
if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, "") + "B";
if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
return num.toLocaleString();
},

parseBet: function(str, balance) {
str = str.toLowerCase().replace(/,/g, "");
if (str === "all") return Math.min(balance, 269000000000);
if (str === "max") return 269000000000;
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
const TWO_HOURS = 7200000;
const MAX_SPIN = 50;

if (!statsDB[userID]) statsDB[userID] = { wins: 0, streak: 0, plays: 0, spinsLeft: MAX_SPIN, lastReset: now };
let stats = statsDB[userID];

if (now - stats.lastReset >= TWO_HOURS) {
stats.spinsLeft = MAX_SPIN;
stats.lastReset = now;
}

if (stats.spinsLeft <= 0) {
let msLeft = TWO_HOURS - (now - stats.lastReset);
let h = Math.floor(msLeft / 3600000);
let m = Math.floor((msLeft % 3600000) / 60000);
return sendMsg(`⏳ 𝐋𝐈𝐌𝐈𝐓 𝐒𝐄𝐒𝐇\n2𝐡𝐫 𝐩𝐨𝐫 𝐚𝐛𝐚𝐫 50 𝐭𝐚 𝐬𝐩𝐢𝐧 𝐩𝐚𝐛𝐚\n🕒 𝐁𝐚𝐤𝐢: ${h}𝐡 ${m}𝐦`);
}

let bet = 100000000;
if (args[0]) bet = this.parseBet(args[0], user.balance);

if (isNaN(bet)) return sendMsg(`❌ Janu thik moto bet dao. Ex: #slot3 100m | #slot3 all`);
if (bet < 100000) return sendMsg(`❌ Janu Minimum bet 100,000,000`);
if (bet > 269000000000) return sendMsg(`❌ Janu Max bet 269,000,000,000`);
if (user.balance < bet) return sendMsg(`💸 Janu Balance kom! Tmr balance: $${this.formatMoney(user.balance)}`);

stats.plays++;
stats.spinsLeft--;

const roll = Math.random();
let tier = "lose";
let multiplier = 0;

if (roll < 0.05) {
tier = "jackpot";
multiplier = 10;
} else if (roll < 0.25) {
tier = "great";
multiplier = 5;
} else if (roll < 0.55) {
tier = "nice";
multiplier = 1.5;
}

let payout = 0;
let resultText = "";

if (tier!== "lose") {
payout = bet * multiplier;
user.balance += payout - bet;
stats.wins++;
stats.streak++;
} else {
user.balance -= bet;
stats.streak = 0;
resultText = "💀 𝐁𝐔𝐒𝐓𝐄𝐃 💀";
}

await user.save();

const emojis = ["💎","🔮","🍒","7️⃣","👑","💰"];
const slot1 = emojis[Math.floor(Math.random()*6)];
const slot2 = emojis[Math.floor(Math.random()*6)];
const slot3 = emojis[Math.floor(Math.random()*6)];

if (tier === "jackpot") {
resultText = "✨ 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝐇𝐈𝐓! 10x ✨";
} else if (tier === "great") {
resultText = "🌟 𝐆𝐑𝐄𝐀𝐓 𝐇𝐈𝐓! 5x 🌟";
} else if (tier === "nice") {
resultText = "🔥 𝐍𝐈𝐂𝐄 𝐇𝐈𝐓! 1.5x 🔥";
}

const used = MAX_SPIN - stats.spinsLeft;

return sendMsg( `🌌 ━━ 𝑺𝑨𝒁𝒁𝑨𝑫'𝑺 𝒁𝑶𝑵𝑬 ━━ 🌌
[ ${slot1} | ${slot2} | ${slot3} ]
${resultText}
💰 𝐁𝐞𝐭: $${bet.toLocaleString()}
${tier!== "lose"? `🟢 𝐏𝐚𝐲𝐨𝐮𝐭: +$${payout.toLocaleString()}` : `🔴 𝐋𝐨𝐬𝐬: -$${bet.toLocaleString()}`}
💳 𝐖𝐚𝐥𝐥𝐞𝐭: $${user.balance.toLocaleString()}
🎟️ 𝐒𝐩𝐢𝐧𝐬: ${stats.spinsLeft}/50
🏆 𝐖𝐢𝐧𝐬: ${stats.wins}
🔥 𝐒𝐭𝐫𝐞𝐚𝐤: ${stats.streak}
📊 𝐋𝐢𝐦𝐢𝐭𝐬: ${used}/50` );
}
};
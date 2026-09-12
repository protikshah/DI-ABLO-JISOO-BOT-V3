const mongoose = require("mongoose");

// ==================== SCHEMA ====================
const minerSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  userName: { type: String, default: "Unknown" },
  balance: { type: Number, default: 1000 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  lastMineTime: { type: Number, default: 0 },
  title: { type: String, default: "novice miner" },
  totalEarned: { type: Number, default: 0 },
  pickaxe: { type: String, default: "Wooden Pickaxe" },
  inventory: {
    stone: { type: Number, default: 0 },
    coal: { type: Number, default: 0 },
    copper: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    platinum: { type: Number, default: 0 },
    emerald: { type: Number, default: 0 },
    ruby: { type: Number, default: 0 },
    sapphire: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    obsidian: { type: Number, default: 0 },
    netherite: { type: Number, default: 0 },
    mythril: { type: Number, default: 0 },
    voidcrystal: { type: Number, default: 0 }
  },
  dailyTasks: {
    lastReset: { type: Number, default: 0 },
    mineCount: { type: Number, default: 0 },
    foundCoal: { type: Number, default: 0 },
    foundIron: { type: Number, default: 0 },
    foundGold: { type: Number, default: 0 },
    foundDiamond: { type: Number, default: 0 },
    upgradedPickaxe: { type: Boolean, default: false },
    earnedToday: { type: Number, default: 0 },
    claimedReward: { type: Boolean, default: false }
  }
});

const MinerUser = mongoose.models.DiabloMinerUserV2 || mongoose.model("DiabloMinerUserV2", minerSchema);

// ==================== 20 PICKAXES ====================
const PICKAXES = {
  "Wooden Pickaxe":     { price: 0,            multiplier: 1,   reqLevel: 1,   emoji: "🪵" },
  "Stone Pickaxe":      { price: 100000,       multiplier: 1.5, reqLevel: 2,   emoji: "🪨" },
  "Copper Pickaxe":     { price: 500000,       multiplier: 2,   reqLevel: 3,   emoji: "🟠" },
  "Iron Pickaxe":       { price: 2000000,      multiplier: 3,   reqLevel: 5,   emoji: "⚙️" },
  "Steel Pickaxe":      { price: 5000000,      multiplier: 4,   reqLevel: 7,   emoji: "🔩" },
  "Silver Pickaxe":     { price: 10000000,     multiplier: 5,   reqLevel: 9,   emoji: "🥈" },
  "Golden Pickaxe":     { price: 25000000,     multiplier: 6.5, reqLevel: 12,  emoji: "🪙" },
  "Platinum Pickaxe":   { price: 50000000,     multiplier: 8,   reqLevel: 15,  emoji: "⚪" },
  "Emerald Pickaxe":    { price: 100000000,    multiplier: 10,  reqLevel: 18,  emoji: "🟢" },
  "Ruby Pickaxe":       { price: 200000000,    multiplier: 12,  reqLevel: 21,  emoji: "🔴" },
  "Sapphire Pickaxe":   { price: 400000000,    multiplier: 15,  reqLevel: 25,  emoji: "🔵" },
  "Obsidian Pickaxe":   { price: 800000000,    multiplier: 18,  reqLevel: 30,  emoji: "⬛" },
  "Diamond Pickaxe":    { price: 1500000000,   multiplier: 22,  reqLevel: 35,  emoji: "💎" },
  "Netherite Pickaxe":  { price: 3000000000,   multiplier: 27,  reqLevel: 40,  emoji: "🌌" },
  "Titanium Pickaxe":   { price: 6000000000,   multiplier: 33,  reqLevel: 45,  emoji: "⚡" },
  "Mythril Pickaxe":    { price: 12000000000,  multiplier: 40,  reqLevel: 50,  emoji: "🌟" },
  "Adamantium Pickaxe": { price: 25000000000,  multiplier: 48,  reqLevel: 60,  emoji: "🛡️" },
  "Cosmic Pickaxe":     { price: 50000000000,  multiplier: 58,  reqLevel: 70,  emoji: "🌠" },
  "Void Pickaxe":       { price: 100000000000, multiplier: 70,  reqLevel: 85,  emoji: "🕳️" },
  "Laser Drill":        { price: 500000000000, multiplier: 100, reqLevel: 100, emoji: "🔫" }
};

// ==================== 15 ORES ====================
const ORES = {
  stone:       { name: "Stone",         emoji: "🪨",  value: 50000,       xp: 20,    chance: 16,   tier: 1 },
  coal:        { name: "Coal",          emoji: "⚫",  value: 100000,      xp: 30,    chance: 10,   tier: 2 },
  copper:      { name: "Copper",        emoji: "🟠",  value: 200000,      xp: 45,    chance: 15,   tier: 3 },
  iron:        { name: "Iron",          emoji: "⚙️",  value: 500000,      xp: 70,    chance: 12,   tier: 4 },
  silver:      { name: "Silver",        emoji: "🥈",  value: 1000000,     xp: 110,   chance: 8,    tier: 5 },
  gold:        { name: "Gold",          emoji: "🪙",  value: 2500000,     xp: 180,   chance: 6,    tier: 6 },
  platinum:    { name: "Platinum",      emoji: "⚪",  value: 5000000,     xp: 280,   chance: 4,    tier: 7 },
  emerald:     { name: "Emerald",       emoji: "🟢",  value: 15000000,    xp: 450,   chance: 19,    tier: 8 },
  ruby:        { name: "Ruby",          emoji: "🔴",  value: 30000000,    xp: 700,   chance: 2.5,  tier: 9 },
  sapphire:    { name: "Sapphire",      emoji: "🔵",  value: 60000000,    xp: 9000,  chance: 2,    tier: 10 },
  diamond:     { name: "Diamond",       emoji: "💎",  value: 79080000,   xp: 1200,  chance: 6.2,  tier: 11 },
  obsidian:    { name: "Obsidian",      emoji: "⬛",  value: 400000000,   xp: 3000,  chance: 1.6,  tier: 12 },
  netherite:   { name: "Netherite",     emoji: "🌌",  value: 1000000000,  xp: 5000,  chance: 0.7,  tier: 13 },
  mythril:     { name: "Mythril",       emoji: "🌟",  value: 3000000000,  xp: 9000,  chance: 0.6,  tier: 14 },
  voidcrystal: { name: "Void Crystal",  emoji: "🕳️",  value: 10000000000, xp: 20000, chance: 0.4,  tier: 15 }
};

// ==================== TITLES ====================
const TITLES = {
  1:   "novice miner",
  5:   "stone breaker",
  10:  "iron digger",
  15:  "silver hunter",
  20:  "gold seeker",
  25:  "platinum excavator",
  30:  "emerald miner",
  35:  "ruby collector",
  40:  "sapphire lord",
  50:  "diamond miner",
  60:  "obsidian lord",
  70:  "netherite knight",
  80:  "mythril legend",
  90:  "void master",
  100: "immortal miner"
};

module.exports = {
  config: {
    name: "mine",
    aliases: ["mining"],
    version: "5.0.0",
    author: "protik shah",
    countDown: 3,
    role: 0,
    shortDescription: "mine ores & upgrade pickaxe",
    category: "game",
    guide: {
      en: "{p}mine\n{p}mine shop\n{p}mine inv\n{p}mine sell\n{p}mine task\n{p}mine top"
    }
  },

  formatMoney: (num) => {
    const n = Number(num) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2).replace(/\.?0+$/, "") + "K";
    return Math.floor(n).toString();
  },

  progressBar: (current, max, size = 12) => {
    const c = Number(current) || 0;
    const m = Number(max) || 1;
    const filled = Math.max(0, Math.min(size, Math.round((c / m) * size)));
    return "█".repeat(filled) + "░".repeat(size - filled);
  },

  getTitle: (level) => {
    let title = "novice miner";
    for (const [lv, t] of Object.entries(TITLES)) {
      if (level >= parseInt(lv)) title = t;
    }
    return title;
  },

  regenEnergy: (user) => {
    const now = Date.now();
    const REGEN = 2 * 60 * 1000;
    const elapsed = now - (user.lastMineTime || 0);
    const added = Math.floor(elapsed / REGEN);
    if (added > 0) {
      user.energy = Math.min(user.maxEnergy || 100, (user.energy || 0) + added);
      user.lastMineTime = now;
    }
  },

  repairUser: async (user) => {
    let changed = false;
    if (typeof user.balance !== "number") { user.balance = 1000; changed = true; }
    if (typeof user.xp !== "number") { user.xp = 0; changed = true; }
    if (typeof user.level !== "number") { user.level = 1; changed = true; }
    if (typeof user.energy !== "number") { user.energy = 100; changed = true; }
    if (typeof user.maxEnergy !== "number") { user.maxEnergy = 100; changed = true; }
    if (typeof user.totalEarned !== "number") { user.totalEarned = 0; changed = true; }

    if (!user.inventory) user.inventory = {};
    for (const key of Object.keys(ORES)) {
      if (typeof user.inventory[key] !== "number") {
        user.inventory[key] = 0;
        changed = true;
      }
    }

    if (!user.dailyTasks) user.dailyTasks = {};
    const taskDefaults = {
      lastReset: 0, mineCount: 0, foundCoal: 0, foundIron: 0,
      foundGold: 0, foundDiamond: 0, upgradedPickaxe: false,
      earnedToday: 0, claimedReward: false
    };
    for (const [key, def] of Object.entries(taskDefaults)) {
      if (typeof user.dailyTasks[key] !== typeof def) {
        user.dailyTasks[key] = def;
        changed = true;
      }
    }

    if (changed) await user.save();
    return user;
  },

  checkDailyReset: (user) => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (!user.dailyTasks || now - (user.dailyTasks.lastReset || 0) > ONE_DAY) {
      user.dailyTasks = {
        mineCount: 0, foundCoal: 0, foundIron: 0, foundGold: 0,
        foundDiamond: 0, upgradedPickaxe: false, earnedToday: 0,
        claimedReward: false, lastReset: now
      };
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;
    const sub = (args[0] || "").toLowerCase();

    try {
      let user = await MinerUser.findOne({ userID: senderID });
      if (!user) {
        user = new MinerUser({ userID: senderID });
        await user.save();
      } else {
        await this.repairUser(user);
      }

      try {
        const info = await api.getUserInfo(senderID);
        user.userName = info[senderID]?.name || "Unknown";
        await user.save();
      } catch (e) {}

      this.regenEnergy(user);
      this.checkDailyReset(user);

      // ==================== SHOP ====================
      if (sub === "shop" || sub === "mineshop") {
        const item = args.slice(1).join(" ").trim();

        if (!item) {
          let txt = "⛏️ ᴍɪɴɪɴɢ sʜᴏᴘ ⛏️\n\n";
          txt += `ᴜsᴇʀ: ${user.userName}\n`;
          txt += `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}\n`;
          txt += `ᴘɪᴄᴋᴀxᴇ: ${user.pickaxe} ${PICKAXES[user.pickaxe]?.emoji || ""}\n`;
          txt += `ʟᴇᴠᴇʟ: ${user.level}\n\n`;
          txt += "ᴘɪᴄᴋᴀxᴇs (20)\n";
          txt += "─────────────────────\n";

          let i = 1;
          for (const [name, info] of Object.entries(PICKAXES)) {
            const owned = user.pickaxe === name ? " ✅" : "";
            const locked = user.level < info.reqLevel ? " 🔒" : "";
            txt += `${i}. ${info.emoji} ${name}${owned}${locked}\n`;
            txt += `   💵 $${this.formatMoney(info.price)} │ x${info.multiplier} │ ʟᴠ.${info.reqLevel}\n`;
            i++;
          }

          txt += "\nʙᴜʏ: {p}mine shop <name>";
          return sendMsg(txt);
        }

        const matched = Object.keys(PICKAXES).find(k => k.toLowerCase() === item.toLowerCase());
        if (!matched) return sendMsg("❌ ᴘɪᴄᴋᴀxᴇ ɴᴏᴛ ғᴏᴜɴᴅ");
        const info = PICKAXES[matched];

        if (user.level < info.reqLevel) return sendMsg(`🔒 ɴᴇᴇᴅ ʟᴇᴠᴇʟ ${info.reqLevel}`);
        if (user.balance < info.price) {
          return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs\nɴᴇᴇᴅ: $${this.formatMoney(info.price)}\nʏᴏᴜ ʜᴀᴠᴇ: $${this.formatMoney(user.balance)}`);
        }
        if (user.pickaxe === matched) return sendMsg("❌ ʏᴏᴜ ᴀʟʀᴇᴀᴅʏ ᴏᴡɴ ᴛʜɪs ᴘɪᴄᴋᴀxᴇ");

        user.balance -= info.price;
        user.pickaxe = matched;
        user.dailyTasks.upgradedPickaxe = true;
        await user.save();

        return sendMsg(
          "🎉 ᴘɪᴄᴋᴀxᴇ ᴜᴘɢʀᴀᴅᴇᴅ\n\n" +
          `${info.emoji} ɴᴇᴡ: ${matched}\n` +
          `ᴍᴜʟᴛɪᴘʟɪᴇʀ: x${info.multiplier}\n` +
          `ᴄᴏsᴛ: -$${this.formatMoney(info.price)}\n` +
          `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}`
        );
      }

      // ==================== INVENTORY ====================
      if (sub === "inv" || sub === "mineinv" || sub === "inventory") {
        let txt = "🎒 ʏᴏᴜʀ ᴍɪɴᴇʀ ʙᴀɢ 🎒\n\n";

        let total = 0, items = 0;
        for (const [key, amount] of Object.entries(user.inventory)) {
          if (amount > 0) {
            const ore = ORES[key];
            const val = amount * ore.value;
            txt += `${ore.emoji} ${ore.name} x${amount} → $${this.formatMoney(val)}\n`;
            total += val;
            items += amount;
          }
        }

        if (items === 0) txt += "🟡 ʙᴀɢ ɪs ᴇᴍᴘᴛʏ. sᴛᴀʀᴛ ᴍɪɴɪɴɢ!\n";
        txt += `\nᴛᴏᴛᴀʟ ɪᴛᴇᴍs: ${items}\n`;
        txt += `ᴛᴏᴛᴀʟ ᴠᴀʟᴜᴇ: $${this.formatMoney(total)}\n\n`;
        txt += "sᴇʟʟ: {p}mine sell";
        return sendMsg(txt);
      }

      // ==================== SELL ====================
      if (sub === "sell") {
        let total = 0, items = 0;
        for (const [key, amount] of Object.entries(user.inventory)) {
          if (amount > 0) {
            total += amount * ORES[key].value;
            items += amount;
            user.inventory[key] = 0;
          }
        }
        if (total === 0) return sendMsg("🟡 ɴᴏᴛʜɪɴɢ ᴛᴏ sᴇʟʟ");

        user.balance += total;
        user.totalEarned += total;
        user.dailyTasks.earnedToday = (user.dailyTasks.earnedToday || 0) + total;
        await user.save();

        return sendMsg(
          "💰 sᴏʟᴅ sᴜᴄᴄᴇssғᴜʟʟʏ\n\n" +
          `ɪᴛᴇᴍs: ${items}\n` +
          `ᴇᴀʀɴᴇᴅ: +$${this.formatMoney(total)}\n` +
          `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}`
        );
      }

      // ==================== DAILY TASK ====================
      if (sub === "task" || sub === "minetask") {
        const task = user.dailyTasks;
        const earned = Number(task.earnedToday) || 0;

        if (args[1] && args[1].toLowerCase() === "claim") {
          const allDone =
            (task.mineCount || 0) >= 10 &&
            (task.foundCoal || 0) >= 5 &&
            (task.foundIron || 0) >= 3 &&
            (task.foundGold || 0) >= 2 &&
            (task.foundDiamond || 0) >= 1 &&
            task.upgradedPickaxe &&
            earned >= 100000000;

          if (task.claimedReward) return sendMsg("❌ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ᴛᴏᴅᴀʏ");
          if (!allDone) return sendMsg("❌ ᴄᴏᴍᴘʟᴇᴛᴇ ᴀʟʟ 7 ᴛᴀsᴋs ғɪʀsᴛ");

          const bonus = 10000000 * user.level;
          const bonusXP = 2000 * user.level;
          user.balance += bonus;
          user.xp += bonusXP;
          task.claimedReward = true;
          await user.save();

          return sendMsg(
            "🎁 ᴅᴀɪʟʏ ʀᴇᴡᴀʀᴅ ᴄʟᴀɪᴍᴇᴅ\n\n" +
            `ᴄᴀsʜ: +$${this.formatMoney(bonus)}\n` +
            `xᴘ: +${bonusXP}`
          );
        }

        const t1 = Math.min(task.mineCount || 0, 10);
        const t2 = Math.min(task.foundCoal || 0, 5);
        const t3 = Math.min(task.foundIron || 0, 3);
        const t4 = Math.min(task.foundGold || 0, 2);
        const t5 = Math.min(task.foundDiamond || 0, 1);
        const t6 = task.upgradedPickaxe ? 1 : 0;
        const t7 = Math.min(earned / 100000000, 1);
        const progress = Math.round(((t1/10 + t2/5 + t3/3 + t4/2 + t5 + t6 + t7) / 7) * 100);

        let txt = "📋 ᴅᴀɪʟʏ ᴍɪɴɪɴɢ ᴛᴀsᴋs 📋\n\n";
        txt += `ᴜsᴇʀ: ${user.userName}\n`;
        txt += `ᴛɪᴛʟᴇ: ${user.title}\n`;
        txt += `ᴘʀᴏɢʀᴇss: ${this.progressBar(progress, 100, 14)} ${progress}%\n\n`;
        txt += `${(task.mineCount||0) >= 10 ? "✅" : "⬜"} 1. ᴍɪɴᴇ 10 ᴛɪᴍᴇs  [${task.mineCount||0}/10]\n`;
        txt += `${(task.foundCoal||0) >= 5 ? "✅" : "⬜"} 2. ғɪɴᴅ 5 ᴄᴏᴀʟ  [${task.foundCoal||0}/5]\n`;
        txt += `${(task.foundIron||0) >= 3 ? "✅" : "⬜"} 3. ғɪɴᴅ 3 ɪʀᴏɴ  [${task.foundIron||0}/3]\n`;
        txt += `${(task.foundGold||0) >= 2 ? "✅" : "⬜"} 4. ғɪɴᴅ 2 ɢᴏʟᴅ  [${task.foundGold||0}/2]\n`;
        txt += `${(task.foundDiamond||0) >= 1 ? "✅" : "⬜"} 5. ғɪɴᴅ 1 ᴅɪᴀᴍᴏɴᴅ  [${task.foundDiamond||0}/1]\n`;
        txt += `${task.upgradedPickaxe ? "✅" : "⬜"} 6. ᴜᴘɢʀᴀᴅᴇ ᴘɪᴄᴋᴀxᴇ\n`;
        txt += `${earned >= 100000000 ? "✅" : "⬜"} 7. ᴇᴀʀɴ $100ᴍ ᴛᴏᴅᴀʏ  [$${this.formatMoney(earned)}]\n\n`;

        if (task.mineCount >= 10 && task.foundCoal >= 5 && task.foundIron >= 3 &&
            task.foundGold >= 2 && task.foundDiamond >= 1 && task.upgradedPickaxe &&
            earned >= 100000000) {
          txt += task.claimedReward
            ? "🎉 ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ᴛᴏᴅᴀʏ"
            : "🎁 ᴄʟᴀɪᴍ: {p}mine task claim";
        } else {
          txt += "💡 ᴄᴏᴍᴘʟᴇᴛᴇ ᴀʟʟ 7 ᴛᴀsᴋs ғᴏʀ ʀᴇᴡᴀʀᴅ";
        }
        return sendMsg(txt);
      }

      // ==================== LEADERBOARD ====================
      if (sub === "top" || sub === "minetop" || sub === "lb") {
        const all = await MinerUser.find({}).sort({ level: -1, balance: -1 }).limit(10);
        let txt = "🏆 ᴍɪɴɪɴɢ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ 🏆\n\n";

        let rank = 1;
        for (const u of all) {
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
          const name = (u.userName || u.userID).slice(0, 16);
          txt += `${medal} ${name}\n`;
          txt += `   ʟᴠ.${u.level} │ $${this.formatMoney(u.balance)}\n`;
          rank++;
        }

        if (rank === 1) txt += "🟡 ɴᴏ ᴍɪɴᴇʀs ʏᴇᴛ";
        return sendMsg(txt);
      }

      // ==================== CORE MINE ====================
      if (user.energy < 1) {
        return sendMsg(
          "🔋 ᴏᴜᴛ ᴏғ ᴇɴᴇʀɢʏ\n\n" +
          `ᴇɴᴇʀɢʏ: ${this.progressBar(0, user.maxEnergy, 14)}\n` +
          "ʀᴇᴄʜᴀʀɢᴇs 1 ᴇᴠᴇʀʏ 2 ᴍɪɴᴜᴛᴇs"
        );
      }

      const pick = PICKAXES[user.pickaxe] || PICKAXES["Wooden Pickaxe"];
      const luck = pick.multiplier;

      // ★ EXPONENTIAL RARITY BOOST ★
      const entries = Object.entries(ORES);
      const weighted = entries.map(([key, ore]) => {
        // Rare ore gets exponentially more boost from luck
        const rarityBoost = Math.pow(luck, ore.tier / 5);
        return { key, weight: ore.chance * rarityBoost };
      });
      const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
      let rand = Math.random() * totalWeight;
      let found = "stone";
      for (const w of weighted) {
        rand -= w.weight;
        if (rand <= 0) { found = w.key; break; }
      }

      const ore = ORES[found];
      user.energy -= 1;
      user.lastMineTime = Date.now();
      user.inventory[found] = (user.inventory[found] || 0) + 1;
      user.xp += ore.xp;
      user.dailyTasks.mineCount = (user.dailyTasks.mineCount || 0) + 1;
      user.dailyTasks.earnedToday = (user.dailyTasks.earnedToday || 0) + ore.value;

      if (found === "coal") user.dailyTasks.foundCoal = (user.dailyTasks.foundCoal || 0) + 1;
      if (found === "iron") user.dailyTasks.foundIron = (user.dailyTasks.foundIron || 0) + 1;
      if (found === "gold") user.dailyTasks.foundGold = (user.dailyTasks.foundGold || 0) + 1;
      if (found === "diamond") user.dailyTasks.foundDiamond = (user.dailyTasks.foundDiamond || 0) + 1;

      let leveledUp = false;
      const requiredXP = user.level * 500;
      if (user.xp >= requiredXP) {
        user.level += 1;
        user.xp -= requiredXP;
        user.maxEnergy += 5;
        user.energy = user.maxEnergy;
        user.title = this.getTitle(user.level);
        leveledUp = true;
      }

      await user.save();

      let msg = "⛏️ ᴍɪɴɪɴɢ ʀᴇsᴜʟᴛ ⛏️\n\n";
      msg += `${ore.emoji} ғᴏᴜɴᴅ: ${ore.name}\n`;
      msg += `ᴠᴀʟᴜᴇ: +$${this.formatMoney(ore.value)}\n`;
      msg += `xᴘ: +${ore.xp}\n`;
      msg += `ᴇɴᴇʀɢʏ: ${this.progressBar(user.energy, user.maxEnergy, 12)} ${user.energy}/${user.maxEnergy}\n`;
      msg += `ᴘɪᴄᴋᴀxᴇ: ${pick.emoji} ${user.pickaxe} (x${luck})\n`;
      msg += `ᴛɪᴛʟᴇ: ${user.title}`;

      if (leveledUp) {
        msg += "\n\n🎉 ʟᴇᴠᴇʟ ᴜᴘ!\n";
        msg += `ʀᴇᴀᴄʜᴇᴅ: ʟᴇᴠᴇʟ ${user.level}\n`;
        msg += `ᴍᴀx ᴇɴᴇʀɢʏ: ${user.maxEnergy}`;
      }

      return sendMsg(msg);

    } catch (err) {
      console.error("Mine Error:", err);
      return sendMsg(`❌ ${err.message || "ᴍɪɴɪɴɢ ғᴀɪʟᴇᴅ"}`);
    }
  }
};
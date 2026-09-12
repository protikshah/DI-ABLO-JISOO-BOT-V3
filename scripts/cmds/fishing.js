const mongoose = require("mongoose");

// ==================== SCHEMA ====================
const fisherSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  userName: { type: String, default: "Unknown" },
  balance: { type: Number, default: 1000 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  lastFishTime: { type: Number, default: 0 },
  title: { type: String, default: "novice angler" },
  totalEarned: { type: Number, default: 0 },
  rod: { type: String, default: "Wooden Rod" },
  inventory: {
    shrimp: { type: Number, default: 0 },
    sardine: { type: Number, default: 0 },
    mackerel: { type: Number, default: 0 },
    tuna: { type: Number, default: 0 },
    salmon: { type: Number, default: 0 },
    catfish: { type: Number, default: 0 },
    pufferfish: { type: Number, default: 0 },
    swordfish: { type: Number, default: 0 },
    octopus: { type: Number, default: 0 },
    shark: { type: Number, default: 0 },
    goldfish: { type: Number, default: 0 },
    dolphin: { type: Number, default: 0 },
    whale: { type: Number, default: 0 },
    kraken: { type: Number, default: 0 },
    voidleviathan: { type: Number, default: 0 }
  },
  dailyTasks: {
    lastReset: { type: Number, default: 0 },
    fishCount: { type: Number, default: 0 },
    foundTuna: { type: Number, default: 0 },
    foundSalmon: { type: Number, default: 0 },
    foundShark: { type: Number, default: 0 },
    foundGoldfish: { type: Number, default: 0 },
    upgradedRod: { type: Boolean, default: false },
    earnedToday: { type: Number, default: 0 },
    claimedReward: { type: Boolean, default: false }
  }
});

const FisherUser = mongoose.models.DiabloFisherUserV2 || mongoose.model("DiabloFisherUserV2", fisherSchema);

// ==================== 20 RODS ====================
const RODS = {
  "Wooden Rod":        { price: 0,            multiplier: 1,   reqLevel: 1,   emoji: "🪵" },
  "Bamboo Rod":        { price: 100000,       multiplier: 1.5, reqLevel: 2,   emoji: "🎋" },
  "Copper Rod":        { price: 500000,       multiplier: 2,   reqLevel: 3,   emoji: "🟠" },
  "Iron Rod":          { price: 2000000,      multiplier: 3,   reqLevel: 5,   emoji: "⚙️" },
  "Steel Rod":         { price: 5000000,      multiplier: 4,   reqLevel: 7,   emoji: "🔩" },
  "Silver Rod":        { price: 10000000,     multiplier: 5,   reqLevel: 9,   emoji: "🥈" },
  "Golden Rod":        { price: 25000000,     multiplier: 6.5, reqLevel: 12,  emoji: "🪙" },
  "Platinum Rod":      { price: 50000000,     multiplier: 8,   reqLevel: 15,  emoji: "⚪" },
  "Emerald Rod":       { price: 100000000,    multiplier: 10,  reqLevel: 18,  emoji: "🟢" },
  "Ruby Rod":          { price: 200000000,    multiplier: 12,  reqLevel: 21,  emoji: "🔴" },
  "Sapphire Rod":      { price: 400000000,    multiplier: 15,  reqLevel: 25,  emoji: "🔵" },
  "Obsidian Rod":      { price: 800000000,    multiplier: 18,  reqLevel: 30,  emoji: "⬛" },
  "Diamond Rod":       { price: 1500000000,   multiplier: 22,  reqLevel: 35,  emoji: "💎" },
  "Netherite Rod":     { price: 3000000000,   multiplier: 27,  reqLevel: 40,  emoji: "🌌" },
  "Titanium Rod":      { price: 6000000000,   multiplier: 33,  reqLevel: 45,  emoji: "⚡" },
  "Mythril Rod":       { price: 12000000000,  multiplier: 40,  reqLevel: 50,  emoji: "🌟" },
  "Adamantium Rod":    { price: 25000000000,  multiplier: 48,  reqLevel: 60,  emoji: "🛡️" },
  "Cosmic Rod":        { price: 50000000000,  multiplier: 58,  reqLevel: 70,  emoji: "🌠" },
  "Void Rod":          { price: 100000000000, multiplier: 70,  reqLevel: 85,  emoji: "🕳️" },
  "Laser Harpoon":     { price: 500000000000, multiplier: 100, reqLevel: 100, emoji: "🔫" }
};

// ==================== 15 FISH ====================
const FISH = {
  shrimp:        { name: "Shrimp",         emoji: "🦐",  value: 50000,       xp: 20,    chance: 15,   tier: 1 },
  sardine:       { name: "Sardine",        emoji: "🐟",  value: 100000,      xp: 30,    chance: 17,   tier: 2 },
  mackerel:      { name: "Mackerel",       emoji: "🐠",  value: 200000,      xp: 45,    chance: 15,   tier: 3 },
  tuna:          { name: "Tuna",           emoji: "🐟",  value: 500000,      xp: 70,    chance: 12,   tier: 4 },
  salmon:        { name: "Salmon",         emoji: "🍣",  value: 1000000,     xp: 110,   chance: 8,    tier: 5 },
  catfish:       { name: "Catfish",        emoji: "🐡",  value: 2500000,     xp: 180,   chance: 8,    tier: 6 },
  pufferfish:    { name: "Pufferfish",     emoji: "🐡",  value: 5000000,     xp: 280,   chance: 9,    tier: 7 },
  swordfish:     { name: "Swordfish",      emoji: "🗡️",  value: 15000000,    xp: 450,   chance: 9,    tier: 8 },
  octopus:       { name: "Octopus",        emoji: "🐙",  value: 30000000,    xp: 700,   chance: 4.5,  tier: 9 },
  shark:         { name: "Shark",          emoji: "🦈",  value: 60000000,    xp: 850,   chance: 8,    tier: 10 },
  goldfish:      { name: "Goldfish",       emoji: "🐠",  value: 90000000,   xp: 1000,  chance: 7.2,  tier: 11 },
  dolphin:       { name: "Dolphin",        emoji: "🐬",  value: 400000000,   xp: 3000,  chance: 2.6,  tier: 12 },
  whale:         { name: "Whale",          emoji: "🐋",  value: 1000000000,  xp: 5000,  chance: 2.4,  tier: 13 },
  kraken:        { name: "Kraken",         emoji: "🦑",  value: 3000000000,  xp: 6000,  chance: 2.2,  tier: 14 },
  voidleviathan: { name: "Void Leviathan", emoji: "🕳️",  value: 10000000000, xp: 20000, chance: 0.9,  tier: 15 }
};

// ==================== TITLES ====================
const TITLES = {
  1:   "novice angler",
  5:   "river fisher",
  10:  "lake hunter",
  15:  "sea angler",
  20:  "deep sea hunter",
  25:  "shark slayer",
  30:  "whale watcher",
  35:  "ocean raider",
  40:  "master angler",
  50:  "deep lord",
  60:  "kraken hunter",
  70:  "leviathan slayer",
  80:  "legendary angler",
  90:  "void fisher",
  100: "immortal angler"
};

module.exports = {
  config: {
    name: "fish",
    aliases: ["fishing"],
    version: "4.0.0",
    author: "protik shah",
    countDown: 3,
    role: 0,
    shortDescription: "🎣 fish & upgrade rod",
    category: "game",
    guide: {
      en: "{p}fish\n{p}fish shop\n{p}fish inv\n{p}fish sell\n{p}fish task\n{p}fish top"
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
    let title = "novice angler";
    for (const [lv, t] of Object.entries(TITLES)) {
      if (level >= parseInt(lv)) title = t;
    }
    return title;
  },

  regenEnergy: (user) => {
    const now = Date.now();
    const REGEN = 2 * 60 * 1000;
    const elapsed = now - (user.lastFishTime || 0);
    const added = Math.floor(elapsed / REGEN);
    if (added > 0) {
      user.energy = Math.min(user.maxEnergy || 100, (user.energy || 0) + added);
      user.lastFishTime = now;
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
    for (const key of Object.keys(FISH)) {
      if (typeof user.inventory[key] !== "number") {
        user.inventory[key] = 0;
        changed = true;
      }
    }

    if (!user.dailyTasks) user.dailyTasks = {};
    const taskDefaults = {
      lastReset: 0, fishCount: 0, foundTuna: 0, foundSalmon: 0,
      foundShark: 0, foundGoldfish: 0, upgradedRod: false,
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
        fishCount: 0, foundTuna: 0, foundSalmon: 0, foundShark: 0,
        foundGoldfish: 0, upgradedRod: false, earnedToday: 0,
        claimedReward: false, lastReset: now
      };
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;
    const sub = (args[0] || "").toLowerCase();

    try {
      let user = await FisherUser.findOne({ userID: senderID });
      if (!user) {
        user = new FisherUser({ userID: senderID });
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
      if (sub === "shop" || sub === "fishshop") {
        const item = args.slice(1).join(" ").trim();

        if (!item) {
          let txt = "🎣 ғɪsʜɪɴɢ sʜᴏᴘ 🎣\n\n";
          txt += `ᴜsᴇʀ: ${user.userName}\n`;
          txt += `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}\n`;
          txt += `ʀᴏᴅ: ${user.rod} ${RODS[user.rod]?.emoji || ""}\n`;
          txt += `ʟᴇᴠᴇʟ: ${user.level}\n\n`;
          txt += "ʀᴏᴅs (20)\n";
          txt += "─────────────────────\n";

          let i = 1;
          for (const [name, info] of Object.entries(RODS)) {
            const owned = user.rod === name ? " ✅" : "";
            const locked = user.level < info.reqLevel ? " 🔒" : "";
            txt += `${i}. ${info.emoji} ${name}${owned}${locked}\n`;
            txt += `   💵 $${this.formatMoney(info.price)} │ x${info.multiplier} │ ʟᴠ.${info.reqLevel}\n`;
            i++;
          }

          txt += "\nʙᴜʏ: {p}fish shop <name>";
          return sendMsg(txt);
        }

        const matched = Object.keys(RODS).find(k => k.toLowerCase() === item.toLowerCase());
        if (!matched) return sendMsg("❌ ʀᴏᴅ ɴᴏᴛ ғᴏᴜɴᴅ");
        const info = RODS[matched];

        if (user.level < info.reqLevel) return sendMsg(`🔒 ɴᴇᴇᴅ ʟᴇᴠᴇʟ ${info.reqLevel}`);
        if (user.balance < info.price) {
          return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs\nɴᴇᴇᴅ: $${this.formatMoney(info.price)}\nʏᴏᴜ ʜᴀᴠᴇ: $${this.formatMoney(user.balance)}`);
        }
        if (user.rod === matched) return sendMsg("❌ ʏᴏᴜ ᴀʟʀᴇᴀᴅʏ ᴏᴡɴ ᴛʜɪs ʀᴏᴅ");

        user.balance -= info.price;
        user.rod = matched;
        user.dailyTasks.upgradedRod = true;
        await user.save();

        return sendMsg(
          "🎉 ʀᴏᴅ ᴜᴘɢʀᴀᴅᴇᴅ\n\n" +
          `${info.emoji} ɴᴇᴡ: ${matched}\n` +
          `ᴍᴜʟᴛɪᴘʟɪᴇʀ: x${info.multiplier}\n` +
          `ᴄᴏsᴛ: -$${this.formatMoney(info.price)}\n` +
          `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}`
        );
      }

      // ==================== INVENTORY ====================
      if (sub === "inv" || sub === "fishinv" || sub === "inventory") {
        let txt = "🎒 ʏᴏᴜʀ ᴀǫᴜᴀʀɪᴜᴍ 🎒\n\n";

        let total = 0, items = 0;
        for (const [key, amount] of Object.entries(user.inventory)) {
          if (amount > 0) {
            const fish = FISH[key];
            const val = amount * fish.value;
            txt += `${fish.emoji} ${fish.name} x${amount} → $${this.formatMoney(val)}\n`;
            total += val;
            items += amount;
          }
        }

        if (items === 0) txt += "🟡 ᴀǫᴜᴀʀɪᴜᴍ ɪs ᴇᴍᴘᴛʏ. sᴛᴀʀᴛ ғɪsʜɪɴɢ!\n";
        txt += `\nᴛᴏᴛᴀʟ ɪᴛᴇᴍs: ${items}\n`;
        txt += `ᴛᴏᴛᴀʟ ᴠᴀʟᴜᴇ: $${this.formatMoney(total)}\n\n`;
        txt += "sᴇʟʟ: {p}fish sell";
        return sendMsg(txt);
      }

      // ==================== SELL ====================
      if (sub === "sell") {
        let total = 0, items = 0;
        for (const [key, amount] of Object.entries(user.inventory)) {
          if (amount > 0) {
            total += amount * FISH[key].value;
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
      if (sub === "task" || sub === "fishtask") {
        const task = user.dailyTasks;
        const earned = Number(task.earnedToday) || 0;

        if (args[1] && args[1].toLowerCase() === "claim") {
          const allDone =
            (task.fishCount || 0) >= 10 &&
            (task.foundTuna || 0) >= 5 &&
            (task.foundSalmon || 0) >= 3 &&
            (task.foundShark || 0) >= 2 &&
            (task.foundGoldfish || 0) >= 1 &&
            task.upgradedRod &&
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

        const t1 = Math.min(task.fishCount || 0, 10);
        const t2 = Math.min(task.foundTuna || 0, 5);
        const t3 = Math.min(task.foundSalmon || 0, 3);
        const t4 = Math.min(task.foundShark || 0, 2);
        const t5 = Math.min(task.foundGoldfish || 0, 1);
        const t6 = task.upgradedRod ? 1 : 0;
        const t7 = Math.min(earned / 100000000, 1);
        const progress = Math.round(((t1/10 + t2/5 + t3/3 + t4/2 + t5 + t6 + t7) / 7) * 100);

        let txt = "📋 ᴅᴀɪʟʏ ғɪsʜɪɴɢ ᴛᴀsᴋs 📋\n\n";
        txt += `ᴜsᴇʀ: ${user.userName}\n`;
        txt += `ᴛɪᴛʟᴇ: ${user.title}\n`;
        txt += `ᴘʀᴏɢʀᴇss: ${this.progressBar(progress, 100, 14)} ${progress}%\n\n`;
        txt += `${(task.fishCount||0) >= 10 ? "✅" : "⬜"} 1. ғɪsʜ 10 ᴛɪᴍᴇs  [${task.fishCount||0}/10]\n`;
        txt += `${(task.foundTuna||0) >= 5 ? "✅" : "⬜"} 2. ᴄᴀᴛᴄʜ 5 ᴛᴜɴᴀ  [${task.foundTuna||0}/5]\n`;
        txt += `${(task.foundSalmon||0) >= 3 ? "✅" : "⬜"} 3. ᴄᴀᴛᴄʜ 3 sᴀʟᴍᴏɴ  [${task.foundSalmon||0}/3]\n`;
        txt += `${(task.foundShark||0) >= 2 ? "✅" : "⬜"} 4. ᴄᴀᴛᴄʜ 2 sʜᴀʀᴋ  [${task.foundShark||0}/2]\n`;
        txt += `${(task.foundGoldfish||0) >= 1 ? "✅" : "⬜"} 5. ᴄᴀᴛᴄʜ 1 ɢᴏʟᴅғɪsʜ  [${task.foundGoldfish||0}/1]\n`;
        txt += `${task.upgradedRod ? "✅" : "⬜"} 6. ᴜᴘɢʀᴀᴅᴇ ʀᴏᴅ\n`;
        txt += `${earned >= 100000000 ? "✅" : "⬜"} 7. ᴇᴀʀɴ $100ᴍ ᴛᴏᴅᴀʏ  [$${this.formatMoney(earned)}]\n\n`;

        if (task.fishCount >= 10 && task.foundTuna >= 5 && task.foundSalmon >= 3 &&
            task.foundShark >= 2 && task.foundGoldfish >= 1 && task.upgradedRod &&
            earned >= 100000000) {
          txt += task.claimedReward
            ? "🎉 ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ᴛᴏᴅᴀʏ"
            : "🎁 ᴄʟᴀɪᴍ: {p}fish task claim";
        } else {
          txt += "💡 ᴄᴏᴍᴘʟᴇᴛᴇ ᴀʟʟ 7 ᴛᴀsᴋs ғᴏʀ ʀᴇᴡᴀʀᴅ";
        }
        return sendMsg(txt);
      }

      // ==================== LEADERBOARD ====================
      if (sub === "top" || sub === "fishtop" || sub === "lb") {
        const all = await FisherUser.find({}).sort({ level: -1, balance: -1 }).limit(10);
        let txt = "🏆 ғɪsʜɪɴɢ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ 🏆\n\n";

        let rank = 1;
        for (const u of all) {
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
          const name = (u.userName || u.userID).slice(0, 16);
          txt += `${medal} ${name}\n`;
          txt += `   ʟᴠ.${u.level} │ $${this.formatMoney(u.balance)}\n`;
          rank++;
        }

        if (rank === 1) txt += "🟡 ɴᴏ ᴀɴɢʟᴇʀs ʏᴇᴛ";
        return sendMsg(txt);
      }

      // ==================== CORE FISH ====================
      if (user.energy < 1) {
        return sendMsg(
          "🔋 ᴏᴜᴛ ᴏғ ᴇɴᴇʀɢʏ\n\n" +
          `ᴇɴᴇʀɢʏ: ${this.progressBar(0, user.maxEnergy, 14)}\n` +
          "ʀᴇᴄʜᴀʀɢᴇs 1 ᴇᴠᴇʀʏ 2 ᴍɪɴᴜᴛᴇs"
        );
      }

      const rod = RODS[user.rod] || RODS["Wooden Rod"];
      const luck = rod.multiplier;

      // Weighted random
      const entries = Object.entries(FISH);
      const weighted = entries.map(([key, fish]) => {
        const rarityBoost = 1 + ((fish.tier - 1) * (luck - 1) * 0.12);
        return { key, weight: fish.chance * rarityBoost };
      });
      const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
      let rand = Math.random() * totalWeight;
      let found = "shrimp";
      for (const w of weighted) {
        rand -= w.weight;
        if (rand <= 0) { found = w.key; break; }
      }

      const fish = FISH[found];
      user.energy -= 1;
      user.lastFishTime = Date.now();
      user.inventory[found] = (user.inventory[found] || 0) + 1;
      user.xp += fish.xp;
      user.dailyTasks.fishCount = (user.dailyTasks.fishCount || 0) + 1;
      user.dailyTasks.earnedToday = (user.dailyTasks.earnedToday || 0) + fish.value;

      if (found === "tuna") user.dailyTasks.foundTuna = (user.dailyTasks.foundTuna || 0) + 1;
      if (found === "salmon") user.dailyTasks.foundSalmon = (user.dailyTasks.foundSalmon || 0) + 1;
      if (found === "shark") user.dailyTasks.foundShark = (user.dailyTasks.foundShark || 0) + 1;
      if (found === "goldfish") user.dailyTasks.foundGoldfish = (user.dailyTasks.foundGoldfish || 0) + 1;

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

      let msg = "🎣 ғɪsʜɪɴɢ ʀᴇsᴜʟᴛ 🎣\n\n";
      msg += `${fish.emoji} ᴄᴀᴜɢʜᴛ: ${fish.name}\n`;
      msg += `ᴠᴀʟᴜᴇ: +$${this.formatMoney(fish.value)}\n`;
      msg += `xᴘ: +${fish.xp}\n`;
      msg += `ᴇɴᴇʀɢʏ: ${this.progressBar(user.energy, user.maxEnergy, 12)} ${user.energy}/${user.maxEnergy}\n`;
      msg += `ʀᴏᴅ: ${rod.emoji} ${user.rod} (x${luck})\n`;
      msg += `ᴛɪᴛʟᴇ: ${user.title}`;

      if (leveledUp) {
        msg += "\n\n🎉 ʟᴇᴠᴇʟ ᴜᴘ!\n";
        msg += `ʀᴇᴀᴄʜᴇᴅ: ʟᴇᴠᴇʟ ${user.level}\n`;
        msg += `ᴍᴀx ᴇɴᴇʀɢʏ: ${user.maxEnergy}`;
      }

      return sendMsg(msg);

    } catch (err) {
      console.error("Fish Error:", err);
      return sendMsg(`❌ ${err.message || "ғɪsʜɪɴɢ ғᴀɪʟᴇᴅ"}`);
    }
  }
};
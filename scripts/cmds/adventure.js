const mongoose = require("mongoose");

// ==================== SCHEMA ====================
const adventureSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  userName: { type: String, default: "Unknown" },
  balance: { type: Number, default: 1000 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  lastAdvTime: { type: Number, default: 0 },
  title: { type: String, default: "novice" },
  totalEarned: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalMissions: { type: Number, default: 0 },
  bag: {
    sword: { type: Number, default: 0 },
    dagger: { type: Number, default: 0 },
    axe: { type: Number, default: 0 },
    spear: { type: Number, default: 0 },
    bow: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    katana: { type: Number, default: 0 },
    shield: { type: Number, default: 0 },
    helmet: { type: Number, default: 0 },
    chestplate: { type: Number, default: 0 },
    leggings: { type: Number, default: 0 },
    boots: { type: Number, default: 0 },
    ring: { type: Number, default: 0 },
    amulet: { type: Number, default: 0 },
    cloak: { type: Number, default: 0 },
    orb: { type: Number, default: 0 },
    scroll: { type: Number, default: 0 },
    potion: { type: Number, default: 0 },
    elixir: { type: Number, default: 0 },
    poison: { type: Number, default: 0 },
    revive: { type: Number, default: 0 },
    dragonarmor: { type: Number, default: 0 },
    godspear: { type: Number, default: 0 },
    titanshield: { type: Number, default: 0 },
    phoenixfeather: { type: Number, default: 0 },
    voidgem: { type: Number, default: 0 },
    celestialcrown: { type: Number, default: 0 },
    ancienttome: { type: Number, default: 0 },
    luckycoin: { type: Number, default: 0 },
    shadowcloak: { type: Number, default: 0 },
    stardust: { type: Number, default: 0 }
  },
  dailyTasks: {
    lastReset: { type: Number, default: 0 },
    advCount: { type: Number, default: 0 },
    winCount: { type: Number, default: 0 },
    dragonKills: { type: Number, default: 0 },
    treasureFound: { type: Number, default: 0 },
    itemsBought: { type: Number, default: 0 },
    goldEarned: { type: Number, default: 0 },
    rareItemFound: { type: Number, default: 0 },
    bossDefeated: { type: Number, default: 0 },
    claimedReward: { type: Boolean, default: false }
  }
});

const AdventureUser = mongoose.models.DiabloAdventureUserV2 || mongoose.model("DiabloAdventureUserV2", adventureSchema);

// ==================== 31 SHOP ITEMS ====================
const SHOP = {
  sword:         { name: "Sword",           emoji: "⚔️",  price: 500000,        boost: 5,   category: "weapon" },
  dagger:        { name: "Dagger",          emoji: "🗡️",  price: 300000,        boost: 3,   category: "weapon" },
  axe:           { name: "Battle Axe",      emoji: "🪓",  price: 800000,        boost: 7,   category: "weapon" },
  spear:         { name: "Spear",           emoji: "🔱",  price: 1500000,       boost: 10,  category: "weapon" },
  bow:           { name: "Long Bow",        emoji: "🏹",  price: 2500000,       boost: 12,  category: "weapon" },
  staff:         { name: "Magic Staff",     emoji: "🪄",  price: 5000000,       boost: 15,  category: "weapon" },
  katana:        { name: "Katana",          emoji: "🗡️",  price: 10000000,      boost: 20,  category: "weapon" },

  shield:        { name: "Wooden Shield",   emoji: "🛡️",  price: 400000,        boost: 4,   category: "armor" },
  helmet:        { name: "Iron Helmet",     emoji: "⛑️",  price: 1200000,       boost: 6,   category: "armor" },
  chestplate:    { name: "Chestplate",      emoji: "🥋",  price: 3000000,       boost: 10,  category: "armor" },
  leggings:      { name: "Leggings",        emoji: "👖",  price: 2000000,       boost: 8,   category: "armor" },
  boots:         { name: "Swift Boots",     emoji: "👢",  price: 800000,        boost: 5,   category: "armor" },

  ring:          { name: "Magic Ring",      emoji: "💍",  price: 5000000,       boost: 12,  category: "magic" },
  amulet:        { name: "Amulet",          emoji: "📿",  price: 8000000,       boost: 15,  category: "magic" },
  cloak:         { name: "Invisibility",    emoji: "👻",  price: 15000000,      boost: 18,  category: "magic" },
  orb:           { name: "Magic Orb",       emoji: "🔮",  price: 25000000,      boost: 22,  category: "magic" },
  scroll:        { name: "Ancient Scroll",  emoji: "📜",  price: 40000000,      boost: 28,  category: "magic" },

  potion:        { name: "Health Potion",   emoji: "🧪",  price: 200000,        boost: 2,   category: "potion" },
  elixir:        { name: "Elixir",          emoji: "🍶",  price: 1000000,       boost: 5,   category: "potion" },
  poison:        { name: "Poison Vial",     emoji: "☠️",  price: 3000000,       boost: 8,   category: "potion" },
  revive:        { name: "Revive Scroll",   emoji: "💫",  price: 8000000,       boost: 12,  category: "potion" },

  luckycoin:     { name: "Lucky Coin",      emoji: "🪙",  price: 20000000,      boost: 15,  category: "special" },
  stardust:      { name: "Stardust",        emoji: "✨",  price: 50000000,      boost: 25,  category: "special" },
  shadowcloak:   { name: "Shadow Cloak",    emoji: "🌑",  price: 75000000,      boost: 30,  category: "special" },
  ancienttome:   { name: "Ancient Tome",    emoji: "📖",  price: 100000000,     boost: 35,  category: "special" },
  dragonarmor:   { name: "Dragon Armor",    emoji: "🐲",  price: 250000000,     boost: 45,  category: "special" },
  titanshield:   { name: "Titan Shield",    emoji: "🛡️",  price: 500000000,     boost: 55,  category: "special" },
  godspear:      { name: "God Spear",       emoji: "⚡",  price: 1000000000,    boost: 70,  category: "special" },
  phoenixfeather:{ name: "Phoenix Feather", emoji: "🔥",  price: 2500000000,    boost: 85,  category: "special" },
  voidgem:       { name: "Void Gem",        emoji: "🕳️",  price: 5000000000,    boost: 100, category: "special" },
  celestialcrown:{ name: "Celestial Crown", emoji: "👑",  price: 10000000000,   boost: 150, category: "special" }
};

// ==================== 20 MISSIONS ====================
const MISSIONS = [
  { name: "explore dark forest",     emoji: "🌲", reward: 200000,  xp: 100,  tier: 1 },
  { name: "hunt wild boar",          emoji: "🐗", reward: 250000,  xp: 120,  tier: 1 },
  { name: "rescue villager",         emoji: "🧑", reward: 300000,  xp: 150,  tier: 2 },
  { name: "raid the museum",         emoji: "🏛️", reward: 350000,  xp: 180,  tier: 2 },
  { name: "defend the castle",       emoji: "🏰", reward: 400000,  xp: 200,  tier: 3 },
  { name: "find hidden treasure",    emoji: "💰", reward: 450000,  xp: 250,  tier: 3 },
  { name: "fight the demon",         emoji: "👹", reward: 500000,  xp: 300,  tier: 4 },
  { name: "rescue the princess",     emoji: "👸", reward: 550000,  xp: 320,  tier: 4 },
  { name: "hunt the werewolf",       emoji: "🐺", reward: 600000,  xp: 350,  tier: 5 },
  { name: "slay the dragon",         emoji: "🐉", reward: 700000,  xp: 400,  tier: 5 },
  { name: "sea monster hunt",        emoji: "🐙", reward: 800000,  xp: 450,  tier: 6 },
  { name: "battle in heaven",        emoji: "⚡", reward: 900000,  xp: 500,  tier: 6 },
  { name: "explore ancient ruins",   emoji: "🏚️", reward: 1000000, xp: 550,  tier: 7 },
  { name: "defeat the lich king",    emoji: "💀", reward: 1200000, xp: 650,  tier: 7 },
  { name: "escape the dungeon",      emoji: "⛓️", reward: 1400000, xp: 750,  tier: 8 },
  { name: "hunt the vampire lord",   emoji: "🧛", reward: 1600000, xp: 850,  tier: 8 },
  { name: "conquer the underworld",  emoji: "🔥", reward: 2000000, xp: 1000, tier: 9 },
  { name: "slay the titan",          emoji: "🗿", reward: 2500000, xp: 1200, tier: 10 },
  { name: "battle the void god",     emoji: "🌌", reward: 3000000, xp: 1500, tier: 10 },
  { name: "become the chosen one",   emoji: "🌟", reward: 5000000, xp: 2000, tier: 11 }
];

// ==================== TITLES ====================
const TITLES = {
  1:   "novice",
  5:   "warrior",
  10:  "knight",
  15:  "veteran",
  20:  "lord",
  25:  "champion",
  30:  "dragon slayer",
  35:  "hero",
  40:  "legend",
  50:  "grandmaster",
  60:  "elite",
  70:  "mythic",
  80:  "demigod",
  90:  "god slayer",
  100: "immortal"
};

module.exports = {
  config: {
    name: "adventure",
    aliases: ["adv"],
    version: "10.0.0",
    author: "protik shah",
    countDown: 2,
    role: 0,
    shortDescription: "adventure rpg game",
    category: "game",
    guide: {
      en: "{p}adv\n{p}adv shop\n{p}adv bag\n{p}adv task\n{p}adv top"
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
    let title = "novice";
    for (const [lv, t] of Object.entries(TITLES)) {
      if (level >= parseInt(lv)) title = t;
    }
    return title;
  },

  regenEnergy: (user) => {
    const now = Date.now();
    const REGEN = 2 * 60 * 1000;
    const elapsed = now - (user.lastAdvTime || 0);
    const added = Math.floor(elapsed / REGEN);
    if (added > 0) {
      user.energy = Math.min(user.maxEnergy || 100, (user.energy || 0) + added);
      user.lastAdvTime = now;
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
    if (typeof user.totalWins !== "number") { user.totalWins = 0; changed = true; }
    if (typeof user.totalMissions !== "number") { user.totalMissions = 0; changed = true; }

    if (!user.bag) user.bag = {};
    for (const key of Object.keys(SHOP)) {
      if (typeof user.bag[key] !== "number") {
        user.bag[key] = 0;
        changed = true;
      }
    }

    if (!user.dailyTasks) user.dailyTasks = {};
    const taskDefaults = {
      lastReset: 0, advCount: 0, winCount: 0, dragonKills: 0,
      treasureFound: 0, itemsBought: 0, goldEarned: 0,
      rareItemFound: 0, bossDefeated: 0,
      claimedReward: false
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
        advCount: 0, winCount: 0, dragonKills: 0, treasureFound: 0,
        itemsBought: 0, goldEarned: 0, rareItemFound: 0,
        bossDefeated: 0, claimedReward: false, lastReset: now
      };
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message?.reply ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const { senderID } = event;
    const sub = (args[0] || "").toLowerCase();

    try {
      let user = await AdventureUser.findOne({ userID: senderID });
      if (!user) {
        user = new AdventureUser({ userID: senderID });
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
      if (sub === "shop" || sub === "advshop") {
        const item = args.slice(1).join(" ").trim();

        if (!item) {
          let txt = "⚔️ ᴀᴅᴠᴇɴᴛᴜʀᴇ sʜᴏᴘ ⚔️\n\n";
          txt += `ᴜsᴇʀ: ${user.userName}\n`;
          txt += `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}\n`;
          txt += `ᴛɪᴛʟᴇ: ${user.title}\n`;
          txt += `ʟᴇᴠᴇʟ: ${user.level}\n\n`;

          const categories = {
            weapon: "⚔️ ᴡᴇᴀᴘᴏɴs",
            armor: "🛡️ ᴀʀᴍᴏʀ",
            magic: "✨ ᴍᴀɢɪᴄ",
            potion: "🧪 ᴘᴏᴛɪᴏɴs",
            special: "🌟 sᴘᴇᴄɪᴀʟ"
          };

          let i = 1;
          for (const [catKey, catName] of Object.entries(categories)) {
            txt += `${catName}\n`;
            txt += "─────────────────────\n";
            for (const [key, info] of Object.entries(SHOP)) {
              if (info.category === catKey) {
                const owned = user.bag[key] > 0 ? ` ✅x${user.bag[key]}` : "";
                txt += `${i}. ${info.emoji} ${info.name}${owned}\n`;
                txt += `   💵 $${this.formatMoney(info.price)} │ +${info.boost}%\n`;
                i++;
              }
            }
            txt += "\n";
          }

          txt += "ʙᴜʏ: {p}adv shop <name>";
          return sendMsg(txt);
        }

        const matched = Object.keys(SHOP).find(k => k.toLowerCase() === item.toLowerCase());
        if (!matched) return sendMsg("❌ ɪᴛᴇᴍ ɴᴏᴛ ғᴏᴜɴᴅ");
        const info = SHOP[matched];

        if (user.balance < info.price) {
          return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs\nɴᴇᴇᴅ: $${this.formatMoney(info.price)}\nʏᴏᴜ ʜᴀᴠᴇ: $${this.formatMoney(user.balance)}`);
        }

        user.balance -= info.price;
        user.bag[matched] = (user.bag[matched] || 0) + 1;
        user.dailyTasks.itemsBought = (user.dailyTasks.itemsBought || 0) + 1;
        await user.save();

        return sendMsg(
          "🎉 ᴘᴜʀᴄʜᴀsᴇᴅ\n\n" +
          `${info.emoji} ɪᴛᴇᴍ: ${info.name}\n` +
          `ʙᴏᴏsᴛ: +${info.boost}%\n` +
          `ᴄᴏsᴛ: -$${this.formatMoney(info.price)}\n` +
          `ʙᴀʟᴀɴᴄᴇ: $${this.formatMoney(user.balance)}`
        );
      }

      // ==================== BAG ====================
      if (sub === "bag" || sub === "advbag" || sub === "inv") {
        let txt = "🎒 ʏᴏᴜʀ ᴀᴅᴠᴇɴᴛᴜʀᴇ ʙᴀɢ 🎒\n\n";

        let total = 0, boostTotal = 0;
        for (const [key, amount] of Object.entries(user.bag)) {
          if (amount > 0) {
            const info = SHOP[key];
            txt += `${info.emoji} ${info.name} x${amount} (+${info.boost}%)\n`;
            total += amount;
            boostTotal += info.boost * amount;
          }
        }

        if (total === 0) txt += "🟡 ʙᴀɢ ɪs ᴇᴍᴘᴛʏ. ʙᴜʏ ɪᴛᴇᴍs!\n";
        txt += `\nᴛᴏᴛᴀʟ ɪᴛᴇᴍs: ${total}\n`;
        txt += `ᴛᴏᴛᴀʟ ʙᴏᴏsᴛ: +${boostTotal}%\n\n`;
        txt += "sʜᴏᴘ: {p}adv shop";
        return sendMsg(txt);
      }

      // ==================== DAILY TASK ====================
      if (sub === "task" || sub === "advtask") {
        const task = user.dailyTasks;
        const goldEarned = Number(task.goldEarned) || 0;

        if (args[1] && args[1].toLowerCase() === "claim") {
          const allDone =
            (task.advCount || 0) >= 15 &&
            (task.winCount || 0) >= 8 &&
            (task.dragonKills || 0) >= 2 &&
            (task.treasureFound || 0) >= 3 &&
            (task.itemsBought || 0) >= 1 &&
            goldEarned >= 50000000 &&
            (task.rareItemFound || 0) >= 1 &&
            (task.bossDefeated || 0) >= 1;

          if (task.claimedReward) return sendMsg("❌ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ᴛᴏᴅᴀʏ");
          if (!allDone) return sendMsg("❌ ᴄᴏᴍᴘʟᴇᴛᴇ ᴀʟʟ ᴛᴀsᴋs ғɪʀsᴛ");

          const bonus = 23400000 * user.level;
          const bonusXP = 3000 * user.level;
          user.balance += bonus;
          user.xp += bonusXP;
          task.claimedReward = true;
          await user.save();

          return sendMsg(
            "🎁 ᴅᴀɪʟʏ ᴍᴇɢᴀ ʀᴇᴡᴀʀᴅ\n\n" +
            `ᴄᴀsʜ: +$${this.formatMoney(bonus)}\n` +
            `xᴘ: +${bonusXP}`
          );
        }

        const t1 = Math.min(task.advCount || 0, 15);
        const t2 = Math.min(task.winCount || 0, 8);
        const t3 = Math.min(task.dragonKills || 0, 2);
        const t4 = Math.min(task.treasureFound || 0, 3);
        const t5 = Math.min(task.itemsBought || 0, 1);
        const t6 = Math.min(goldEarned / 50000000, 1);
        const t7 = Math.min(task.rareItemFound || 0, 1);
        const t8 = Math.min(task.bossDefeated || 0, 1);
        const totalProgress = ((t1/15 + t2/8 + t3/2 + t4/3 + t5 + t6 + t7 + t8) / 8) * 100;

        let txt = "📋 ᴅᴀɪʟʏ ᴀᴅᴠᴇɴᴛᴜʀᴇ ᴛᴀsᴋs 📋\n\n";
        txt += `ᴜsᴇʀ: ${user.userName}\n`;
        txt += `ᴛɪᴛʟᴇ: ${user.title}\n`;
        txt += `ᴘʀᴏɢʀᴇss: ${this.progressBar(Math.round(totalProgress), 100, 14)} ${Math.round(totalProgress)}%\n\n`;
        txt += `${(task.advCount||0) >= 15 ? "✅" : "⬜"} 1. ᴀᴅᴠᴇɴᴛᴜʀᴇ 15 ᴛɪᴍᴇs  [${task.advCount||0}/15]\n`;
        txt += `${(task.winCount||0) >= 8 ? "✅" : "⬜"} 2. ᴡɪɴ 8 ᴛɪᴍᴇs  [${task.winCount||0}/8]\n`;
        txt += `${(task.dragonKills||0) >= 2 ? "✅" : "⬜"} 3. ᴋɪʟʟ 2 ᴅʀᴀɢᴏɴs  [${task.dragonKills||0}/2]\n`;
        txt += `${(task.treasureFound||0) >= 3 ? "✅" : "⬜"} 4. ғɪɴᴅ 3 ᴛʀᴇᴀsᴜʀᴇ  [${task.treasureFound||0}/3]\n`;
        txt += `${(task.itemsBought||0) >= 1 ? "✅" : "⬜"} 5. ʙᴜʏ 1 ɪᴛᴇᴍ  [${task.itemsBought||0}/1]\n`;
        txt += `${goldEarned >= 50000000 ? "✅" : "⬜"} 6. ᴇᴀʀɴ $50ᴍ ᴛᴏᴅᴀʏ  [$${this.formatMoney(goldEarned)}]\n`;
        txt += `${(task.rareItemFound||0) >= 1 ? "✅" : "⬜"} 7. ғɪɴᴅ 1 ʀᴀʀᴇ ɪᴛᴇᴍ  [${task.rareItemFound||0}/1]\n`;
        txt += `${(task.bossDefeated||0) >= 1 ? "✅" : "⬜"} 8. ᴅᴇғᴇᴀᴛ 1 ʙᴏss  [${task.bossDefeated||0}/1]\n\n`;

        const allDone = task.advCount >= 15 && task.winCount >= 8 && task.dragonKills >= 2 &&
          task.treasureFound >= 3 && task.itemsBought >= 1 && goldEarned >= 50000000 &&
          task.rareItemFound >= 1 && task.bossDefeated >= 1;

        if (allDone) {
          txt += task.claimedReward
            ? "🎉 ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ᴛᴏᴅᴀʏ"
            : "🎁 ᴄʟᴀɪᴍ: {p}adv task claim";
        } else {
          txt += "💡 ᴄᴏᴍᴘʟᴇᴛᴇ ᴀʟʟ ᴛᴀsᴋs ғᴏʀ ᴍᴇɢᴀ ʀᴇᴡᴀʀᴅ";
        }
        return sendMsg(txt);
      }

      // ==================== LEADERBOARD ====================
      if (sub === "top" || sub === "advtop" || sub === "lb") {
        const all = await AdventureUser.find({}).sort({ level: -1, balance: -1 }).limit(10);
        let txt = "🏆 ᴀᴅᴠᴇɴᴛᴜʀᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ 🏆\n\n";

        let rank = 1;
        for (const u of all) {
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
          const name = (u.userName || u.userID).slice(0, 16);
          txt += `${medal} ${name}\n`;
          txt += `   ʟᴠ.${u.level} │ $${this.formatMoney(u.balance)} │ ${u.title || "novice"}\n`;
          rank++;
        }

        if (rank === 1) txt += "🟡 ɴᴏ ᴀᴅᴠᴇɴᴛᴜʀᴇʀs ʏᴇᴛ";
        return sendMsg(txt);
      }

      // ==================== CORE ADVENTURE ====================
      if (user.energy < 1) {
        return sendMsg(
          "🔋 ᴏᴜᴛ ᴏғ ᴇɴᴇʀɢʏ\n\n" +
          `ᴇɴᴇʀɢʏ: ${this.progressBar(0, user.maxEnergy, 14)}\n` +
          "ʀᴇᴄʜᴀʀɢᴇs 1 ᴇᴠᴇʀʏ 2 ᴍɪɴᴜᴛᴇs"
        );
      }

      // Calculate total boost from bag
      let boostPercent = 0;
      for (const [key, amount] of Object.entries(user.bag)) {
        if (amount > 0 && SHOP[key]) {
          boostPercent += SHOP[key].boost * amount;
        }
      }
      const boostMultiplier = 1 + (boostPercent / 100);

      // ★ GENEROUS TIER UNLOCK — Level / 3 + 5 ★
      const maxTier = Math.min(11, Math.floor(user.level / 3) + 5);
      const availableMissions = MISSIONS.filter(m => m.tier <= maxTier);

      // Task-priority boost
      const needDragon = (user.dailyTasks.dragonKills || 0) < 2;
      const needTreasure = (user.dailyTasks.treasureFound || 0) < 3;
      const needBoss = (user.dailyTasks.bossDefeated || 0) < 1;
      const needRare = (user.dailyTasks.rareItemFound || 0) < 1;

      const weightedMissions = availableMissions.map(m => {
        let weight = Math.pow(m.tier, 1.5);
        if (needDragon && m.name.includes("dragon")) weight *= 4;
        if (needTreasure && m.name.includes("treasure")) weight *= 4;
        // Boss mission boost — lich/vampire/underworld/titan/void god/chosen
        if (needBoss && (m.name.includes("lich") || m.name.includes("vampire") || m.name.includes("underworld") || m.name.includes("titan") || m.name.includes("void god") || m.name.includes("chosen"))) weight *= 5;
        if (needRare && m.tier >= 7) weight *= 3;
        return { mission: m, weight };
      });
      const totalMissionWeight = weightedMissions.reduce((s, x) => s + x.weight, 0);

      let missionRand = Math.random() * totalMissionWeight;
      let mission = availableMissions[0];
      for (const w of weightedMissions) {
        missionRand -= w.weight;
        if (missionRand <= 0) { mission = w.mission; break; }
      }

      // 55% win chance
      const isWin = Math.random() < 0.55;

      // Reward calculation
      const rewardBase = mission.reward * boostMultiplier;
      const xpBase = mission.xp * boostMultiplier;
      const reward = isWin ? Math.floor(rewardBase * 0.75) : Math.floor(rewardBase * 0.25);
      const xp = isWin ? Math.floor(xpBase * 0.75) : Math.floor(xpBase * 0.25);

      user.energy -= 1;
      user.lastAdvTime = Date.now();
      user.balance += reward;
      user.xp += xp;
      user.totalEarned += reward;
      user.totalMissions += 1;
      user.dailyTasks.advCount = (user.dailyTasks.advCount || 0) + 1;
      user.dailyTasks.goldEarned = (user.dailyTasks.goldEarned || 0) + reward;

      if (isWin) {
        user.dailyTasks.winCount = (user.dailyTasks.winCount || 0) + 1;
        user.totalWins += 1;
      }

      // ★ Track dragon ★
      if (mission.name.includes("dragon")) {
        user.dailyTasks.dragonKills = (user.dailyTasks.dragonKills || 0) + 1;
      }

      // ★ Track treasure ★
      if (mission.name.includes("treasure")) {
        user.dailyTasks.treasureFound = (user.dailyTasks.treasureFound || 0) + 1;
      }

      // ★ Track boss — lich, vampire, underworld, titan, void god, chosen ★
      if (
        mission.name.includes("lich") ||
        mission.name.includes("vampire") ||
        mission.name.includes("underworld") ||
        mission.name.includes("titan") ||
        mission.name.includes("void god") ||
        mission.name.includes("chosen")
      ) {
        user.dailyTasks.bossDefeated = (user.dailyTasks.bossDefeated || 0) + 1;
      }

      // ★ Track rare item — tier 7+ mission win ★
      if (mission.tier >= 7 && isWin) {
        user.dailyTasks.rareItemFound = (user.dailyTasks.rareItemFound || 0) + 1;
      }

      // Level up
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

      let msg = "⚔️ ᴀᴅᴠᴇɴᴛᴜʀᴇ ʀᴇsᴜʟᴛ ⚔️\n\n";
      msg += `${mission.emoji} ᴍɪssɪᴏɴ: ${mission.name}\n`;
      msg += `ᴛɪᴇʀ: ${mission.tier}\n`;
      msg += `ʀᴇsᴜʟᴛ: ${isWin ? "✅ ᴡɪɴ" : "❌ ʟᴏsᴛ"}\n`;
      msg += `ʀᴇᴡᴀʀᴅ: +$${this.formatMoney(reward)}\n`;
      msg += `xᴘ: +${xp}\n`;
      msg += `ʙᴏᴏsᴛ: +${boostPercent}%\n`;
      msg += `ᴇɴᴇʀɢʏ: ${this.progressBar(user.energy, user.maxEnergy, 12)} ${user.energy}/${user.maxEnergy}\n`;
      msg += `ᴛɪᴛʟᴇ: ${user.title}`;

      if (leveledUp) {
        msg += "\n\n🎉 ʟᴇᴠᴇʟ ᴜᴘ!\n";
        msg += `ʀᴇᴀᴄʜᴇᴅ: ʟᴇᴠᴇʟ ${user.level}\n`;
        msg += `ᴍᴀx ᴇɴᴇʀɢʏ: ${user.maxEnergy}`;
      }

      return sendMsg(msg);

    } catch (err) {
      console.error("Adventure Error:", err);
      return sendMsg(`❌ ${err.message || "ᴀᴅᴠᴇɴᴛᴜʀᴇ ғᴀɪʟᴇᴅ"}`);
    }
  }
};
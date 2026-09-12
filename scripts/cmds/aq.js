module.exports = {
  config: {
    name: "quote",
    aliases: ["animequote", "aq"],
    version: "1.2",
    author: "DI-ABLO",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Get iconic anime quotes with Japanese & Bengali translation."
    },
    longDescription: {
      en: "Displays iconic anime quotes from popular characters in Japanese, English, and Bengali."
    },
    category: "anime",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // 🛡️ AUTHOR VERIFICATION LOCK SYSTEM
    const allowedAuthors = ["DI-ABLO", "di-ablo", "Di-Ablo"];
    const currentAuthor = this.config ? (this.config.author || this.config.credits || "") : "";
    
    const isValidAuthor = allowedAuthors.some(author => currentAuthor.includes(author));

    if (!isValidAuthor) {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      }
      return api.sendMessage(
        "⚠️ [ 𝑆𝐸𝐶𝑈𝑅𝑇𝑌 𝐴𝐿𝐸𝑅𝑇 ] ⚠️\n\n" +
        "❌ 𝑈𝑛𝑎𝑢𝑡ℎ𝑜𝑟𝑖𝑧𝑒𝑑 𝑀𝑜𝑑𝑖𝑓𝑖𝑐𝑎𝑡𝑖𝑜𝑛 𝐷𝑒𝑡𝑒𝑐𝑡𝑒𝑑!\n" +
        "𝑇ℎ𝑖𝑠 𝑐𝑜𝑚𝑚𝑎𝑛𝑑 ℎ𝑎𝑠 𝑏𝑒𝑒𝑛 𝑙𝑜𝑐𝑘𝑒𝑑 𝑏𝑒𝑐𝑎𝑢𝑠𝑒 𝑡ℎ𝑒 𝑜𝑟𝑖𝑔𝑖𝑛𝑎𝑙 𝐴𝑢𝑡ℎ𝑜𝑟 𝑐𝑟𝑒𝑑𝑖𝑡𝑠 𝑤𝑒𝑟𝑒 𝑎𝑙𝑡𝑒𝑟𝑒𝑑.\n\n" +
        "👑 𝑶𝒓𝒊𝒈𝒊𝒏𝒂𝒍 𝑨𝒖𝒕𝒉𝒐𝒓: DI-ABLO",
        event.threadID,
        event.messageID
      );
    }

    // 📜 Reaction
    if (api && typeof api.setMessageReaction === "function") {
      api.setMessageReaction("📜", event.messageID, (err) => {}, true);
    }

    // 🌸 Expanded Anime Quotes Database
    const quotes = [
      {
        character: "Diablo",
        anime: "That Time I Got Reincarnated as a Slime",
        japanese: "リムル様のお言せのままに、全てを滅ぼしましょう。",
        romaji: "Rimuru-sama no oiose no mama ni, subete wo horoboshimashō.",
        english: "As Lord Rimuru commands, I shall destroy everything.",
        bengali: "লর্ড রিমুরুর আদেশ অনুযায়ী, আমি সবকিছু ধ্বংস করে দেব।"
      },
      {
        character: "Rimuru Tempest",
        anime: "That Time I Got Reincarnated as a Slime",
        japanese: "俺の仲間たちに手を出したら、容赦はしない。",
        romaji: "Ore no nakama-tachi ni te wo dashitara, yōsha wa shinai.",
        english: "If you lay a hand on my friends, I will show no mercy.",
        bengali: "আমার বন্ধুদের গায়ে হাত দিলে আমি কোনো দয়া দেখাব না।"
      },
      {
        character: "Sung Jin-Woo",
        anime: "Solo Leveling",
        japanese: "起きろ (オキロ)。",
        romaji: "Okiro.",
        english: "Arise.",
        bengali: "জেগে ওঠো।"
      },
      {
        character: "Hinata Hyuga",
        anime: "Naruto",
        japanese: "まっすぐ自分の言葉は曲げない…私もそれが忍道だから！",
        romaji: "Massugu jibun no kotoba wa megenai... watashi mo sore ga nindō dakara!",
        english: "I never go back on my word... because that's my ninja way too!",
        bengali: "আমিও কখনো নিজের কথা থেকে পিছিয়ে আসি না... কারণ এটাই আমারও নিনজা পথ!"
      },
      {
        character: "Light Yagami",
        anime: "Death Note",
        japanese: "僕は新世界の神となる！",
        romaji: "Boku wa shin sekai no kami to naru!",
        english: "I will become the God of the new world!",
        bengali: "আমি নতুন পৃথিবীর ঈশ্বর হব!"
      },
      {
        character: "Levi Ackerman",
        anime: "Attack on Titan",
        japanese: "悔いのない方を選べ。",
        romaji: "Kui no nai hō wo erabe.",
        english: "Choose the option that you will regret the least.",
        bengali: "সেই পথটি বেছে নাও যেটিতে তোমার আফসোস সবচেয়ে কম হবে।"
      },
      {
        character: "Madara Uchiha",
        anime: "Naruto Shippuden",
        japanese: "この世界には光があるところ、必ず影もある。",
        romaji: "Kono sekai ni wa hikari ga aru tokoro, kanarazu kage mo aru.",
        english: "In this world, wherever there is light, there are also shadows.",
        bengali: "এই পৃথিবীতে যেখানেই আলো থাকে, সেখানেই ছায়াও উপস্থিত থাকে।"
      },
      {
        character: "Gojo Satoru",
        anime: "Jujutsu Kaisen",
        japanese: "大丈夫、僕最強だから。",
        romaji: "Daijōbu, boku saikyō dakara.",
        english: "Don't worry, I'm the strongest.",
        bengali: "চিন্তা কোরো না, কারণ আমিই সেরা।"
      },
      {
        character: "Eren Yeager",
        anime: "Attack on Titan",
        japanese: "戦わなければ勝てない。戦え、戦え！",
        romaji: "Tatakawanakereba katenai. Tatakae, tatakae!",
        english: "If you don't fight, you can't win. Fight, fight!",
        bengali: "লড়াই না করলে জিততে পারবে না। লড়াই করো, লড়াই করো!"
      },
      {
        character: "Naruto Uzumaki",
        anime: "Naruto",
        japanese: "まっすぐ自分の言葉は曲げない。それが俺の忍道だ！",
        romaji: "Massugu jibun no kotoba wa megenai. Sore ga ore no nindō da!",
        english: "I never go back on my word. That is my ninja way!",
        bengali: "আমি কখনো নিজের দেওয়া কথা থেকে পিছিয়ে আসি না। এটাই আমার নিনজা পথ!"
      },
      {
        character: "Roronoa Zoro",
        anime: "One Piece",
        japanese: "背中の傷は剣士の恥だ。",
        romaji: "Senaka no kizu wa kenshi no haji da.",
        english: "A scar on the back is a swordsman's shame.",
        bengali: "পিঠে আঘাত পাওয়া একজন তলোয়ারবাজের জন্য চরম লজ্জার।"
      },
      {
        character: "Itachi Uchiha",
        anime: "Naruto",
        japanese: "人は誰しも、自分の知識や認識に囚われて生きている。",
        romaji: "Hito wa dare shimo, jibun no chishiki ya ninshiki ni torawarete ikiteiru.",
        english: "People live their lives bound by what they accept as correct and true.",
        bengali: "মানুষ যা সত্য বলে মেনে নেয়, তার দ্বারা সীমাবদ্ধ হয়েই তারা বাঁচে।"
      },
      {
        character: "Monkey D. Luffy",
        anime: "One Piece",
        japanese: "海賊王に、俺はなる！",
        romaji: "Kaizoku-ō ni, ore wa naru!",
        english: "I'm going to be the King of the Pirates!",
        bengali: "আমিই হব জলদস্যুদের রাজা!"
      },
      {
        character: "Tanjiro Kamado",
        anime: "Demon Slayer",
        japanese: "打ちのめされても、立ち上がれ！",
        romaji: "Uchinomesarete mo, tachiagare!",
        english: "No matter how many times you get knocked down, get back up!",
        bengali: "যতবারই ভেঙে পড়ো না কেন, বারবার ঘুরে দাঁড়াও!"
      },
      {
        character: "Saitama",
        anime: "One Punch Man",
        japanese: "趣味でヒーローをやっている者だ。",
        romaji: "Shumi de hīrō wo yatteiru mono da.",
        english: "I'm just a guy who's a hero for fun.",
        bengali: "আমি শুধুই শখের বশে হিরোগিরি করা একজন মানুষ।"
      },
      {
        character: "L Lawliet",
        anime: "Death Note",
        japanese: "正義は必ず勝つ！",
        romaji: "Seigi wa kanarazu katsu!",
        english: "Justice will prevail!",
        bengali: "ন্যায্যতা সবসময়ই জয়ী হবে!"
      },
      {
        character: "Sukuna",
        anime: "Jujutsu Kaisen",
        japanese: "頭が高いぞ。",
        romaji: "Atama ga takai zo.",
        english: "Know your place.",
        bengali: "নিজের সীমা চিনে রাখো।"
      },
      {
        character: "Killua Zoldyck",
        anime: "Hunter x Hunter",
        japanese: "ゴン、オレたちの友達だ！",
        romaji: "Gon, ore-tachi no tomodachi da!",
        english: "Gon, you are my light!",
        bengali: "গন, তুমিই আমার পথপ্রদর্শক!"
      },
      {
        character: "Ken Kaneki",
        anime: "Tokyo Ghoul",
        japanese: "この世のすべての不利益は当人の能力不足。",
        romaji: "Kono yo no subete no furieki wa tōnin no nōryoku busoku.",
        english: "All the disadvantage in this world stems from a person's lack of ability.",
        bengali: "পৃথিবীর সমস্ত ব্যর্থতার মূল হলো নিজের যোগ্যতার অভাব।"
      },
      {
        character: "Goku",
        anime: "Dragon Ball Z",
        japanese: "オレは地球からお前を倒すためにやってきたサイヤ人だ！",
        romaji: "Ore wa Chikyū kara omae wo taosu tame ni yattekita Saiya-jin da!",
        english: "I am the Saiyan who came all the way from Earth to defeat you!",
        bengali: "আমি সেই সায়ান, যে তোমাকে পরাস্ত করতে পৃথিবী থেকে এসেছে!"
      }
    ];

    // Pick a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const message = 
      `🏮 [ ANIME QUOTE ] 🏮\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Character: ${randomQuote.character}\n` +
      `🎬 Anime: ${randomQuote.anime}\n\n` +

      `🇯🇵 Japanese: ${randomQuote.japanese}\n` +

      `🗣️ Romaji: "${randomQuote.romaji}"\n` +

      `🇬🇧 English: "${randomQuote.english}"\n` +

      `🇧🇩 Bengali: "${randomQuote.bengali}"\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👑 Author: DI-ABLO `;

    return api.sendMessage(message, event.threadID, () => {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("🌸", event.messageID, (err) => {}, true);
      }
    }, event.messageID);
  }
};
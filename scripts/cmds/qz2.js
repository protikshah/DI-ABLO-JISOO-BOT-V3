const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  quizStats: {
    wins: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "qz2",
    aliases: ["quiz2", "khela"],
    version: "1.0.0",
    author: "Pratik Shah",
    countDown: 5,
    role: 0,
    shortDescription: "বাংলা কুইজ খেলে জিতে নাও $500M",
    category: "game",
    guide: { en: "{p}qz2" }
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, message, commandName }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    const quizData = [
      { q: "ফুটবলের ইতিহাসে সবচেয়ে বেশিবার AFC এশিয়ান কাপ জিতেছে কোন দেশ?", options: ["জাপান", "সৌদি আরব", "ইরান", "দক্ষিণ কোরিয়া"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "সুপারম্যানের পৃথিবীতে পালক পিতার নাম কী?", options: ["জর-এল", "জোনাথন কেন্ট", "থমাস ওয়েন", "পেরি হোয়াইট"], correctIndex: 1, category: "ডিসি ইউনিভার্স" },
      { q: "বিটকয়েনের (Bitcoin) সর্বোচ্চ মোট সরবরাহ বা লিমিট কত?", options: ["১০০ মিলিয়ন", "১৮ মিলিয়ন", "২১ মিলিয়ন", "সীমাহীন"], correctIndex: 2, category: "ক্রিপ্টো" },
      { q: "ঘূর্ণিঝড়ের বাতাসের গতিবেগ পরিমাপ করতে কোন স্কেল ব্যবহার করা হয়?", options: ["রিকটার স্কেল", "বোফোর্ট স্কেল", "সাফির-সিম্পসন স্কেল", "ফুজিতা স্কেল"], correctIndex: 2, category: "আবহাওয়া" },
      { q: "UEFA চ্যাম্পিয়ন্স লিগের ইতিহাসে সর্বোচ্চ গোলদাতা কে?", options: ["লিওনেল মেসি", "রবার্ট লেওয়ানডোভস্কি", "করিম বেনজেমা", "ক্রিস্টিয়ানো রোনালদো"], correctIndex: 3, category: "খেলাধুলা" },
      { q: "মাত্র ১০ দিনে জাভাস্ক্রিপ্ট (JavaScript) প্রোগ্রামিং ভাষা তৈরি করেছিলেন কে?", options: ["ব্রেন্ডন আইচ", "গুইডো ভ্যান রোসাম", "জেমস গসলিং", "বিয়ার্নে স্ট্রোস্ট্রুপ"], correctIndex: 0, category: "আইসিটি" },
      { q: "২০০০ সালের AFC এশিয়ান কাপে সেরা খেলোয়াড় (MVP) হয়েছিলেন কে?", options: ["শুনসুকে নাকামুরা", "হিরোশি নানামি", "কেইসুকে হোন্ডা", "শিঞ্জি কাগাওয়া"], correctIndex: 1, category: "ফুটবল ইতিহাস" },
      { q: "অস্ট্রেলিয়ার রাজধানীর নাম কী?", options: ["সিডনি", "মেলবোর্ন", "ক্যানবেরা", "ব্রিসবেন"], correctIndex: 2, category: "সাধারণ জ্ঞান" },
      { q: "ডিসি কমিক্সে সুপারম্যান যে ছোট শহরে বড় হয়েছে তার নাম কী?", options: ["গথাম সিটি", "স্টার সিটি", "সেন্ট্রাল সিটি", "স্মলভিল"], correctIndex: 3, category: "ডিসি ইউনিভার্স" },
      { q: "১৯৫৮ এবং ১৯৬২ সালে পরপর দুবার ফিফা বিশ্বকাপ জিতেছিল কোন দল?", options: ["ব্রাজিল", "ইতালি", "আর্জেন্টিনা", "জার্মানি"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "ইথেরিয়াম (Ethereum) বর্তমানে কোন নেটওয়ার্ক মেকানিজম ব্যবহার করে?", options: ["প্রুফ অব ওয়ার্ক", "প্রুফ অব স্টেক", "প্রুফ অব অথরিটি", "প্রুফ অব হিস্ট্রি"], correctIndex: 1, category: "ক্রিপ্টো" },
      { q: "পৃথিবীর বায়ুমণ্ডলে সবচেয়ে বেশি পরিমাণে কোন গ্যাস পাওয়া যায়?", options: ["অক্সিজেন", "কার্বন ডাই অক্সাইড", "নাইট্রোজেন", "হাইড্রোজেন"], correctIndex: 2, category: "বিজ্ঞান" },
      { q: "১৯৮৬ সালের বিশ্বকাপে বিখ্যাত 'হ্যান্ড অব গড' গোলটি কোন দেশ করেছিল?", options: ["ব্রাজিল", "ইংল্যান্ড", "জার্মানি", "আর্জেন্টিনা"], correctIndex: 3, category: "ফুটবল ইতিহাস" },
      { q: "ওয়েব ডিজাইনে HTML এর পূর্ণরূপ কী?", options: ["HyperText Markup Language", "HyperTech Machine Language", "HighText Marking Language", "Hyperlink Text Mode Language"], correctIndex: 0, category: "আইসিটি" },
      { q: "পাহাড়ি পর্যটন এলাকা মুঞ্জই পাড়া ও সুন্দর বান্দরবান কোন দেশে অবস্থিত?", options: ["নেপাল", "বাংলাদেশ", "ভারত", "ভুটান"], correctIndex: 1, category: "ভুগোল" },
      { q: "ডিসি ইউনিভার্সে 'ক্যাপড ক্রুসেডার' (Caped Crusader) নামে পরিচিত কে?", options: ["সুপারম্যান", "দ্য ফ্ল্যাশ", "ব্যাটম্যান", "গ্রিন ল্যান্টার্ন"], correctIndex: 2, category: "ডিসি ইউনিভার্স" },
      { q: "ঘূর্ণিঝড়ের কেন্দ্রের ভেতরের শান্ত এলাকাটিকে কী বলা হয়?", options: ["আই ওয়াল", "ভোর্টেক্স", "আই অব দ্য স্টর্ম (ঝড়ের চোখ)", "সেন্টার কোর"], correctIndex: 2, category: "আবহাওয়া" },
      { q: "২০১২ এক ক্যালেন্ডার বর্ষে সর্বোচ্চ ৯১ গোল করার অবিশ্বাস্য রেকর্ড কার?", options: ["ক্রিস্টিয়ানো রোনালদো", "পেলে", "কিলিয়ান এমবাপ্পে", "লিওনেল মেসি"], correctIndex: 3, category: "খেলাধুলা" },
      { q: "বাংলাদেশ ব্যাংক কত সালে আনুষ্ঠানিকভাবে প্রতিষ্ঠিত হয়?", options: ["১৯৭১", "১৯৭২", "১৯৭৪", "১৯৮১"], correctIndex: 1, category: "বাংলাদেশ" },
      { q: "ক্রিপ্টোকারেন্সি মার্কেটে সোলানা (Solana) এর শর্ট টিঙ্কার সংকেত কোনটি?", options: ["SOL", "SLN", "SNA", "SOA"], correctIndex: 0, category: "ক্রিপ্টো" },
      { q: "সুপারম্যানের একমাত্র দুর্বলতা কোনটি, যা তাকে দুর্বল করে দেয়?", options: ["এডামান্টিয়াম", "ক্রিপ্টোনাইট", "ভাইব্রেনিয়াম", "ইউরেনিয়াম"], correctIndex: 1, category: "ডিসি ইউনিভার্স" },
      { q: "১৯৩০ সালে অনুষ্ঠিত সর্বপ্রথম ফিফা বিশ্বকাপ চ্যাম্পিয়ন হয় কোন দেশ?", options: ["আর্জেন্টিনা", "ব্রাজিল", "উরুগুয়ে", "ফ্রান্স"], correctIndex: 2, category: "ফুটবল ইতিহাস" },
      { q: "কম্পিউটার নেটওয়ার্কিং এ সাধারণ HTTP সংযোগের পোর্ট নম্বর কত?", options: ["443", "21", "22", "80"], correctIndex: 3, category: "আইসিটি" },
      { q: "প্রিমিয়ার লিগের ইতিহাসে দ্রুততম হ্যাট্রিকের (২ মিনিট ৫৬ সেকেন্ড) রেকর্ড কার?", options: ["সাদিও মানে", "রবি ফাউলার", "アーলিং হালান্ড", "সার্জিও অ্যাগুয়েরো"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "শূন্যস্থানে আলোর গতিবেগ প্রতি সেকেন্ডে আনুমানিক কত?", options: ["১,৫০,০০০ কিমি", "৩,০০,০০০ কিমি", "৫,০০,০০০ কিমি", "১০,০০,০০০ কিমি"], correctIndex: 1, category: "বিজ্ঞান" },
      { q: "আন্তর্জাতিক ফুটবলে পুরুষের ফুটবলে সর্বকালের সর্বোচ্চ গোলদাতা কে?", options: ["আলী দায়েই", "লিওনেল মেসি", "ক্রিস্টিয়ানো রোনালদো", "ফেরেন্স পুসকাস"], correctIndex: 2, category: "খেলাধুলা" },
      { q: "উইন্ডোজ ১১ প্রো-তে সাধারণত কোন প্রসেসর আর্কিটেকচার ব্যবহৃত হয়?", options: ["x86", "ARM32", "x32", "x64 / ARM64"], correctIndex: 3, category: "টেকনোলজি" },
      { q: "২০২২ ফিফা বিশ্বকাপে গ্রুপ পর্বে স্পেন এবং জার্মানি উভয় দলকে হারিয়েছিল কোন এশিয়ান দল?", options: ["জাপান", "দক্ষিণ কোরিয়া", "সৌদি আরব", "অস্ট্রেলিয়া"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "ক্যাল-এল (Kal-El) কার আসল জন্মগত নাম?", options: ["জড-এল", "সুপারম্যান", "ব্যাটম্যান", "লেক্স লুথর"], correctIndex: 1, category: "ডিসি ইউনিভার্স" },
      { q: "কম্পিউটার ডেটা প্রসেসিংয়ের সবচেয়ে ছোট একক কোনটি?", options: ["বাইট", "নিবল", "বিট", "কিলোবাইট"], correctIndex: 2, category: "আইসিটি" },
      { q: "ঐতিহাসিক ষাট গম্বুজ মসজিদ বাংলাদেশের কোন জেলায় অবস্থিত?", options: ["সিলেট", "রাজশাহী", "খুলনা", "বাগেরহাট"], correctIndex: 3, category: "বাংলাদেশ" },
      { q: "ইউরো ২০১৬ ফাইনাল ম্যাচে পর্তুগালের হয়ে জয়সূচক গোলটি কে করেছিলেন?", options: ["এদের (Eder)", "ক্রিস্টিয়ানো রোনালদো", "নানি", "রিকার্ডো কুয়ারেসমা"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "কম্পিউটারে GPU এর পূর্ণরূপ কী?", options: ["General Processing Unit", "Graphics Processing Unit", "Global Power Unit", "Graphical Performance Utility"], correctIndex: 1, category: "টেকনোলজি" },
      { q: "পর্যায় সারণীতে স্বর্ণের (Gold) রাসায়নিক প্রতীক কোনটি?", options: ["Ag", "Cu", "Au", "Al"], correctIndex: 2, category: "বিজ্ঞান" },
      { q: "ক্রিপ্টো মার্কেটে একটানা দাম কমার প্রবণতাকে কী বলা হয়?", options: ["Bull Market", "Mooning", "HODL", "Bear Market"], correctIndex: 3, category: "ক্রিপ্টো" },
      { q: "কোন ফুটবল স্টেডিয়ামকে 'থিয়েটার অব ড্রীমস' (Theatre of Dreams) বলা হয়?", options: ["ওল্ড ট্রাফোর্ড", "ক্যাম্প ন্যু", " সান্তিয়াগো বার্নাব্যু", "সান সিরো"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "২০১৩ সালে মুক্তি পাওয়া ডিসির সুপারম্যান মুভি 'ম্যান অব স্টিল' কে পরিচালনা করেছিলেন?", options: ["ক্রিস্টোফার নোলান", "জ্যাক স্নাইডার", "জেমস গান", "ম্যাট রিভস"], correctIndex: 1, category: "মুভি" },
      { q: "সাইক্লোনের কেন্দ্রে বায়ুচাপের অবস্থা কেমন থাকে?", options: ["স্বাভাবিক থাকে", "খুব বেড়ে যায়", "অনেক কমে যায়", "হঠাৎ পরিবর্তন হয়"], correctIndex: 2, category: "আবহাওয়া" },
      { q: "পৃথিবীর সর্ববৃহৎ মহাসাগর কোনটি?", options: ["আটলান্টিক মহাসাগর", "ভারত মহাসাগর", "উত্তর মহাসাগর", "প্রশান্ত মহাসাগর"], correctIndex: 3, category: "ভুগোল" },
      { q: "ব্রাজিলে অনুষ্ঠিত ২০১৪ ফিফা ওয়ার্ল্ড কাপ জিতেছিল কোন দেশ?", options: ["জার্মানি", "আর্জেন্টিনা", "নেদারল্যান্ডস", "স্পেন"], correctIndex: 0, category: "খেলাধুলা" },
      { q: "বাংলাদেশের জাতীয় সংগীত 'আমার সোনার বাংলা' এর রচয়িতা কে?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], correctIndex: 1, category: "বাংলাদেশ" },
      { q: "জাপানের রাষ্ট্রীয় মুদ্রার নাম কী?", options: ["ইউয়ান", "ওন", "ইয়েন", "রিঙ্গিত"], correctIndex: 2, category: "সাধারণ জ্ঞান" },
      { q: "২০১৮ সালে রিয়াল মাদ্রিদ ছেড়ে ক্রিস্টিয়ানো রোনালদো কোন ক্লাবে যোগ দিয়েছিলেন?", options: ["ম্যানচেস্টার ইউনাইটেড", "পিএসজি", "বায়ার্ন মিউনিখ", "জুভেন্টাস"], correctIndex: 3, category: "খেলাধুলা" },
      { q: "কম্পিউটার সায়েন্সে 'DBMS' এর পূর্ণরূপ কী?", options: ["Database Management System", "Data Base Module Service", "Digital Binary Management System", "Direct Business Memory System"], correctIndex: 0, category: "আইসিটি" },
      { q: "ডিসি কমিক্সে 'প্রিন্স অব ক্রাইম' বা জোকার কার প্রধান শত্রু?", options: ["সুপারম্যান", "ব্যাটম্যান", "একুয়াম্যান", "সাইবর্গ"], correctIndex: 1, category: "ডিসি ইউনিভার্স" },
      { q: "উত্তর-পশ্চিম প্রশান্ত মহাসাগরে হওয়া ক্রান্তীয় ঘূর্ণিঝড়কে কী বলা হয়?", options: ["টর্নেডো", "ব্লিজার্ড", "টাইফুন", "সাইক্লোন"], correctIndex: 2, category: "আবহাওয়া" },
      { q: "কোন ফুটবল কিংবদন্তিকে 'দ্য গোল্ডেন বয়' (El Pibe de Oro) বলা হতো?", options: ["পেলে", "জিনেদিন জিদান", "রোনালদিনহো", "দিয়েগো মারাদোনা"], correctIndex: 3, category: "ফুটবল ইতিহাস" },
      { q: "২০০৯ সালে উন্মোচিত বিশ্বের প্রথম বিকেন্দ্রীভূত ক্রিপ্টোকারেন্সি কোনটি?", options: ["বিটকয়েন", "লাইটকয়েন", "রিপল", "ইথেরিয়াম"], correctIndex: 0, category: "ক্রিপ্টো" },
      { q: "জাফলং ও লালখাল বাংলাদেশের কোন পর্যটন জেলায় অবস্থিত?", options: ["কক্সবাজার", "সিলেট", "চট্টগ্রাম", "রাঙ্গামাটি"], correctIndex: 1, category: "বাংলাদেশ" },
      { q: "একটি আন্তর্জাতিক ফুটবল ম্যাচে এক দলে মাঠে কতজন খেলোয়াড় খেলে?", options: ["১০ জন", "১২ জন", "১১ জন", "৯ জন"], correctIndex: 2, category: "খেলাধুলা" }
    ];

    const randomQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    const rewardMoney = 500000000; // পুরষ্কার: ৫০০ মিলিয়ন ডলার
    const optionLabels = ["A", "B", "C", "D"];
    const correctAnswerLetter = optionLabels[randomQuiz.correctIndex];
    const correctAnswerText = randomQuiz.options[randomQuiz.correctIndex];

    const quizBox = 
      `✨ ─── [ 🧠 ব্রেইন কুইজ 🧠 ] ─── ✨\n\n` +
      `❓ প্রশ্ন: ${randomQuiz.q}\n\n` +
      `🅰️ ${randomQuiz.options[0]}\n` +
      `🅱️ ${randomQuiz.options[1]}\n` +
      `🅲️ ${randomQuiz.options[2]}\n` +
      `🅳️ ${randomQuiz.options[3]}\n\n` +
      `🏷️ ক্যাটাগরি: ${randomQuiz.category}\n` +
      `🎁 পুরষ্কার: $500M\n` +
      `⏳ সময়: ৩০ সেকেন্ড\n\n` +
      `💬 উত্তর দিতে A, B, C, অথবা D লিখে রিপ্লাই দাও, বন্ধু!`;

    const sentMessage = await sendMsg(quizBox);

    const timerID = setTimeout(() => {
      if (global.GoatBot.onReply.has(sentMessage.messageID)) {
        global.GoatBot.onReply.delete(sentMessage.messageID);
        sendMsg(`⌛ সময় শেষ হয়ে গেছে!\n💡 সঠিক উত্তর ছিল: [ ${correctAnswerLetter} ] ${correctAnswerText}`);
      }
    }, 30000);

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: commandName,
      author: senderID,
      correctLetter: correctAnswerLetter,
      correctText: correctAnswerText.toLowerCase(),
      reward: rewardMoney,
      timerID: timerID
    });
  },

  onReply: async function ({ api, event, message, Reply }) {
    const { senderID, body } = event;
    const { correctLetter, correctText, reward, author, timerID } = Reply;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    if (senderID !== author) {
      return sendMsg("❌ বন্ধু, এটা তোমার কুইজ নয়! নিজের কুইজ খেলতে #qz2 লেখো।");
    }

    clearTimeout(timerID);

    const userInput = body.trim().toLowerCase();
    const isCorrect = (userInput === correctLetter.toLowerCase()) || (userInput === correctText);

    let user = await BankUser.findOne({ userID: senderID });
    if (!user) user = await BankUser.create({ userID: senderID, balance: 1000 });

    if (!user.quizStats) {
      user.quizStats = { wins: 0, total: 0 };
    }

    user.quizStats.total += 1;

    if (isCorrect) {
      user.quizStats.wins += 1;
      const newBalance = user.balance + reward;
      
      await BankUser.updateOne(
        { userID: senderID },
        { 
          $set: { balance: newBalance },
          $inc: { "quizStats.wins": 1, "quizStats.total": 1 }
        }
      );

      global.GoatBot.onReply.delete(Reply.messageID);

      const winRate = ((user.quizStats.wins / user.quizStats.total) * 100).toFixed(1);

      const response = 
        `✨ ─── [ 🧠 ব্রেইন কুইজ 🧠 ] ─── ✨\n\n` +
        `✅ দারুণ! তোমার উত্তর একদম সঠিক হয়েছে!\n` +
        `🎯 তোমার উত্তর: [ ${correctLetter} ]\n` +
        `🎁 তুমি জিতেছ: $${this.formatMoney(reward)}\n\n` +
        `📊 জয়ের হার: ${winRate}% (${user.quizStats.wins}/${user.quizStats.total})\n` +
        `💰 বর্তমান ব্যালেন্স: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } else {
      await BankUser.updateOne(
        { userID: senderID },
        { $inc: { "quizStats.total": 1 } }
      );
      
      global.GoatBot.onReply.delete(Reply.messageID);

      const response = 
        `✨ ─── [ 🧠 ব্রেইন কুইজ 🧠 ] ─── ✨\n\n` +
        `💔 উফ! ভুল উত্তর দিলে বন্ধু!\n` +
        `💡 সঠিক উত্তর ছিল: [ ${correctLetter} ]`;

      return sendMsg(response);
    }
  }
};
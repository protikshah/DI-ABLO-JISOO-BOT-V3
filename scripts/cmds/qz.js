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
    name: "qz",
    aliases: ["quiz", "question"],
    version: "14.0",
    author: "Pratik Shah",
    countDown: 5,
    role: 0,
    shortDescription: "Answer MCQ quiz questions to win $500M",
    category: "game",
    guide: { en: "{p}qz" }
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
      { q: "Which country has won the most AFC Asian Cup titles in football history?", options: ["Japan", "Saudi Arabia", "Iran", "South Korea"], correctIndex: 0, category: "Sports" },
      { q: "Who is the adoptive human father of Superman on Earth?", options: ["Jor-El", "Jonathan Kent", "Thomas Wayne", "Perry White"], correctIndex: 1, category: "DC Universe" },
      { q: "What is the maximum supply cap of Bitcoin that will ever exist?", options: ["100 Million", "18 Million", "21 Million", "Unlimited"], correctIndex: 2, category: "Crypto" },
      { q: "Which scale is used to measure the intensity of wind speed in tropical cyclones?", options: ["Richter Scale", "Beaufort Scale", "Saffir-Simpson Scale", "Fujita Scale"], correctIndex: 2, category: "Weather" },
      { q: "Who holds the record for the most goals in UEFA Champions League history?", options: ["Lionel Messi", "Robert Lewandowski", "Karim Benzema", "Cristiano Ronaldo"], correctIndex: 3, category: "Sports" },
      { q: "Which programming language was created by Brendan Eich in just 10 days?", options: ["JavaScript", "Python", "Java", "C++"], correctIndex: 0, category: "ICT" },
      { q: "Who won the MVP (Most Valuable Player) award in the AFC Asian Cup 2000?", options: ["Shunsuke Nakamura", "Hiroshi Nanami", "Keisuke Honda", "Shinji Kagawa"], correctIndex: 1, category: "Sports History" },
      { q: "What is the capital city of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correctIndex: 2, category: "General Knowledge" },
      { q: "In the DC Universe, what is the fictional home town of Superman?", options: ["Gotham City", "Star City", "Central City", "Smallville"], correctIndex: 3, category: "DC Universe" },
      { q: "Which nation won the FIFA World Cup back-to-back in 1958 and 1962?", options: ["Brazil", "Italy", "Argentina", "Germany"], correctIndex: 0, category: "Sports" },
      { q: "Which consensus mechanism does Ethereum currently use after 'The Merge'?", options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of History"], correctIndex: 1, category: "Crypto" },
      { q: "What is the primary gas found in the Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctIndex: 2, category: "Science" },
      { q: "Which team scored the famous 'Hand of God' goal in the 1986 World Cup?", options: ["Brazil", "England", "Germany", "Argentina"], correctIndex: 3, category: "Sports History" },
      { q: "What does HTML stand for in web development?", options: ["HyperText Markup Language", "HyperTech Machine Language", "HighText Marking Language", "Hyperlink Text Mode Language"], correctIndex: 0, category: "ICT" },
      { q: "Which country is home to the high-altitude tourist district of Bandarban?", options: ["Nepal", "Bangladesh", "India", "Bhutan"], correctIndex: 1, category: "Geography" },
      { q: "Who is known as the Caped Crusader in DC Comics?", options: ["Superman", "The Flash", "Batman", "Green Lantern"], correctIndex: 2, category: "DC Universe" },
      { q: "In weather terminology, what is the outer spinning boundary of a cyclone called?", options: ["Eye", "Wall", "Feeder Band / Rainband", "Vortex Center"], correctIndex: 2, category: "Weather" },
      { q: "Who achieved the incredible feat of scoring 91 goals in a single calendar year (2012)?", options: ["Cristiano Ronaldo", "Pele", "Kylian Mbappe", "Lionel Messi"], correctIndex: 3, category: "Sports" },
      { q: "In which year was the Bangladesh Bank officially established?", options: ["1971", "1972", "1974", "1981"], correctIndex: 1, category: "Bangladesh" },
      { q: "What is the ticker symbol used for Solana in cryptocurrency markets?", options: ["SOL", "SLN", "SNA", "SOA"], correctIndex: 0, category: "Crypto" },
      { q: "Which superhero is vulnerable to the fictional green mineral Kryptonite?", options: ["Aquaman", "Superman", "Shazam", "Cyborg"], correctIndex: 1, category: "DC Universe" },
      { q: "Which country won the inaugural FIFA World Cup title in 1930?", options: ["Argentina", "Brazil", "Uruguay", "France"], correctIndex: 2, category: "Sports History" },
      { q: "What is the default port used for HTTP connections?", options: ["443", "21", "22", "80"], correctIndex: 3, category: "ICT" },
      { q: "Who recorded the fastest hat-trick in Premier League history (2 mins 56 secs)?", options: ["Sadio Mane", "Robbie Fowler", "Erling Haaland", "Sergio Aguero"], correctIndex: 0, category: "Sports" },
      { q: "What is the speed of light in vacuum approximately?", options: ["150,000 km/s", "300,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctIndex: 1, category: "Science" },
      { q: "Who holds the record as the all-time top international goalscorer in men's football?", options: ["Ali Daei", "Lionel Messi", "Cristiano Ronaldo", "Puskas"], correctIndex: 2, category: "Sports" },
      { q: "Which open-source operating system kernel was created by Linus Torvalds?", options: ["Windows", "MacOS", "Android", "Linux"], correctIndex: 3, category: "Tech" },
      { q: "Which Asian national team defeated Spain and Germany in the 2022 FIFA World Cup group stage?", options: ["Japan", "South Korea", "Saudi Arabia", "Australia"], correctIndex: 0, category: "Sports" },
      { q: "What was the birth name given to Superman on his home planet Krypton?", options: ["Zod-El", "Kal-El", "Mon-El", "Jor-El"], correctIndex: 1, category: "DC Universe" },
      { q: "What is the smallest unit of data in computer processing?", options: ["Byte", "Nibble", "Bit", "Kilobyte"], correctIndex: 2, category: "ICT" },
      { q: "Which district in Bangladesh is famous for the Shat Gombuj Mosque?", options: ["Sylhet", "Rajshahi", "Khulna", "Bagerhat"], correctIndex: 3, category: "Bangladesh" },
      { q: "Who scored the winning goal for Portugal in the UEFA Euro 2016 Final?", options: ["Eder", "Cristiano Ronaldo", "Nani", "Ricardo Quaresma"], correctIndex: 0, category: "Sports" },
      { q: "What does GPU stand for in modern computer architecture?", options: ["General Processing Unit", "Graphics Processing Unit", "Global Power Unit", "Graphical Performance Utility"], correctIndex: 1, category: "Tech" },
      { q: "Which chemical element has the symbol 'Au' in the periodic table?", options: ["Silver", "Copper", "Gold", "Aluminum"], correctIndex: 2, category: "Science" },
      { q: "In cryptocurrency, what term describes a market trend where prices are falling rapidly?", options: ["Bull Market", "Mooning", "HODL", "Bear Market"], correctIndex: 3, category: "Crypto" },
      { q: "Which stadium is famously nicknamed 'The Theatre of Dreams'?", options: ["Old Trafford", "Camp Nou", "Santiago Bernabeu", "San Siro"], correctIndex: 0, category: "Sports" },
      { q: "Who directed the 2013 DCEU Superman movie 'Man of Steel'?", options: ["Christopher Nolan", "Zack Snyder", "James Gunn", "Matt Reeves"], correctIndex: 1, category: "Movies" },
      { q: "In weather systems, what happens to air pressure near the center of a tropical cyclone?", options: ["Stays Neutral", "Increases Rapidly", "Drops Significantly", "Fluctuates Randomly"], correctIndex: 2, category: "Weather" },
      { q: "Which is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correctIndex: 3, category: "Geography" },
      { q: "Which country won the FIFA World Cup 2014 in Brazil?", options: ["Germany", "Argentina", "Netherlands", "Spain"], correctIndex: 0, category: "Sports" },
      { q: "Who wrote the national anthem of Bangladesh ('Amar Sonar Bangla')?", options: ["Kazi Nazrul Islam", "Rabindranath Tagore", "Jibanananda Das", "Sukanta Bhattacharya"], correctIndex: 1, category: "Bangladesh" },
      { q: "What is the official currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], correctIndex: 2, category: "General Knowledge" },
      { q: "Which iconic club did Cristiano Ronaldo join after leaving Real Madrid in 2018?", options: ["Manchester United", "PSG", "Bayern Munich", "Juventus"], correctIndex: 3, category: "Sports" },
      { q: "In computer science, what does 'DBMS' stand for?", options: ["Database Management System", "Data Base Module Service", "Digital Binary Management System", "Direct Business Memory System"], correctIndex: 0, category: "ICT" },
      { q: "Which DC villain is known as the 'Clown Prince of Crime'?", options: ["Two-Face", "Joker", "Riddler", "Bane"], correctIndex: 1, category: "DC Universe" },
      { q: "What type of storm is meteorologically identical to a hurricane, but occurs in the Northwestern Pacific?", options: ["Tornado", "Blizzard", "Typhoon", "Sandstorm"], correctIndex: 2, category: "Weather" },
      { q: "Which legendary football player was nicknamed 'The Golden Boy' (El Pibe de Oro)?", options: ["Pele", "Zinedine Zidane", "Ronaldinho", "Diego Maradona"], correctIndex: 3, category: "Sports History" },
      { q: "What was the first decentralized cryptocurrency created in 2009?", options: ["Bitcoin", "Litecoin", "Ripple", "Ethereum"], correctIndex: 0, category: "Crypto" },
      { q: "Which district in Bangladesh is known for the Lalakhal and Jaflong tourist spots?", options: ["Cox's Bazar", "Sylhet", "Chittagong", "Rangamati"], correctIndex: 1, category: "Bangladesh" },
      { q: "How many players are on the pitch for one team in a standard football match?", options: ["10 Players", "12 Players", "11 Players", "9 Players"], correctIndex: 2, category: "Sports" }
    ];

    const randomQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    const rewardMoney = 500000000; // Fixed Quiz Reward: $500 Million
    const optionLabels = ["A", "B", "C", "D"];
    const correctAnswerLetter = optionLabels[randomQuiz.correctIndex];
    const correctAnswerText = randomQuiz.options[randomQuiz.correctIndex];

    const quizBox = 
      `✨ ─── [ ʙʀᴀɪɴ ǫᴜɪᴢ ] ─── ✨\n\n` +
      `❓ ǫᴜᴇsᴛɪᴏɴ: ${randomQuiz.q}\n\n` +
      `🅰️ ${randomQuiz.options[0]}\n` +
      `🅱️ ${randomQuiz.options[1]}\n` +
      `🅲️ ${randomQuiz.options[2]}\n` +
      `🅳️ ${randomQuiz.options[3]}\n\n` +
      `🏷️ ᴄᴀᴛᴇɢᴏʀʏ: ${randomQuiz.category}\n` +
      `🎁 ʀᴇᴡᴀʀᴅ: $500ᴍ\n` +
      `⏳ ᴛɪᴍᴇ: 30 sᴇᴄᴏɴᴅs\n\n` +
      `💬 ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ, ʙ, ᴄ, ᴏʀ ᴅ ᴛᴏ ᴄʟᴀɪᴍ, ʙᴀʙʏ.`;

    const sentMessage = await sendMsg(quizBox);

    const timerID = setTimeout(() => {
      if (global.GoatBot.onReply.has(sentMessage.messageID)) {
        global.GoatBot.onReply.delete(sentMessage.messageID);
        sendMsg(`⌛ ᴛɪᴍᴇ ɪs ᴜᴘ, ʙᴀʙʏ!\n💡 ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ: [ ${correctAnswerLetter} ] ${correctAnswerText}`);
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
      return sendMsg("❌ ʙᴀʙʏ, ᴛʜɪs ɪs ɴᴏᴛ ʏᴏᴜʀ ǫᴜɪᴢ! ᴛʏᴘᴇ #ǫᴢ ᴛᴏ sᴛᴀʀᴛ ʏᴏᴜʀ ᴏᴡɴ.");
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
        `✨ ─── [ ʙʀᴀɪɴ ǫᴜɪᴢ ] ─── ✨\n\n` +
        `✅ ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ, ʙᴀʙʏ!\n` +
        `🎯 ᴄʜᴏɪᴄᴇ: [ ${correctLetter} ]\n` +
        `🎁 ʏᴏᴜ ᴡᴏɴ: $${this.formatMoney(reward)}\n\n` +
        `📊 ᴡɪɴ ʀᴀᴛᴇ: ${winRate}% (${user.quizStats.wins}/${user.quizStats.total})\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } else {
      await BankUser.updateOne(
        { userID: senderID },
        { $inc: { "quizStats.total": 1 } }
      );
      
      global.GoatBot.onReply.delete(Reply.messageID);

      const response = 
        `✨ ─── [ ʙʀᴀɪɴ ǫᴜɪᴢ ] ─── ✨\n\n` +
        `💔 ᴡʀᴏɴɢ ᴀɴsᴡᴇʀ, ʙᴀʙʏ!\n` +
        `💡 ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ: [ ${correctLetter} ]`;

      return sendMsg(response);
    }
  }
};
module.exports = {
  config: {
    name: "roast",
    aliases: ["roast"],
    version: "v1.3",
    author: "Sazzad",
    countDown: 5,
    role: 0,
    shortDescription: "Random roast maro",
    longDescription: "Mention ba reply diye kauke roast koro",
    category: "fun",
    guide: {
      en: "{p}roast [@mention / reply]"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function"? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    let targetID = event.senderID;
    let targetName = await usersData.getName(targetID);

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      targetName = await usersData.getName(targetID);
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      targetName = await usersData.getName(targetID);
    }

    const specialID = "61587127840501";
    const senderID = event.senderID;

    const roastLines = [
      `tor face dekhle wifi o disconnect hoye jay 😂`,
      `tor brain e RAM 128MB 💻`,
      `tor kotha shunle calculator o error dey 🤯`,
      `tui hoili manush rupi load shedding 😴`,
      `tor attitude dekhe Google o bolbe 'did you mean: bechara?' 😆`,
      `tor photo dekhle camera bolbe 'ami tulte parbo na' 📸`,
      `tor moto friend thakle enemy lagena 😎`,
      `tui hoili free fire er bot 🔫`,
      `tor smile dekhe bhut o voy pay 😱`,
      `tui hoili group er spam 📨`,
      `tor IQ room temperature 🌡️`,
      `tui hoili charge chara powerbank 🪫`,
      `tor kotha shunle dictionary kanna kore 😭`,
      `tui hoili walking cringe 🤣`,
      `tor face e filter dileo Kaj hoyna 😅`,
      `tui hoili human version of 404 error 🛑`,
      `tor mathay gobor chara kisui nai 💩`,
      `tui hoili pubg er noob 🎮`,
      `tor roast korar o iccha hoyna karon tui nijei roast 🤷‍♂️`,
      `tui hoili copy kora meme 📸`,
      `tor jibon e WiFi ase kintu connection nai 📶`,
      `tui hoili dustbin er king 👑`,
      `tor face dekhle mirror o crack hoy 🪞`,
      `tui hoili mobile er hang 📵`,
      `Boss sazzad er samne tui ekta poka  🐦`,
      `tui hoili expired chips 🍟`,
      `tor attitude sune google bolbe 'source?' 🤔`,
      `tui hoili group er unpaid comedian 😂`,
      `tor brain e virus dhukse free te 🦠`,
      `tui hoili chapri version of human 😎`,
      `tor photo te caption lage 'do not try this at home' 🚫`,
      `tui hoili loading... 99% 📊`,
      `tor kotha shunle chatgpt o leave ney 🤖`,
      `tui hoili auto correct er shikar 🐞`,
      `tor life e update ashe na 📅`,
      `tui hoili tiktok er puran trend 🎵`,
      `tor mukh dekhle brush o bolbe 'ami parbo na' 🪥`,
      `tui hoili copy paste kora personality 📝`,
      `tor kotha shunle earphone o khule jay 🎧`,
      `tui hoili free te paoa headache 🤯`,
      `tor style dekhe fashion o suicide korbe 😱`,
      `tui hoili group er unwanted notification 📣`,
      `tor brain e space kom dam beshi 📈`,
      `tui hoili recharge chara sim 📱`,
      `tor kotha shunle Siri bolbe 'I can't' 🤖`,
      `tui hoili exam er ager raat 😴`,
      `tor face e beauty cam o kaj korena 📸`,
      `tui hoili 2G speed er manush 📶`,
      `tor kotha shunle radio o off hoye jay 📻`
    ];

    if (senderID === specialID && targetID === specialID) {
      return sendMsg(`Boss tmk roast korar khomota amr nai..🥲`);
    }

    if (targetID === specialID && senderID!== specialID) {
      return sendMsg(`Shor bkaxda boss ke roast korte ashchis? 😡`);
    }

    const randomRoast = roastLines[Math.floor(Math.random() * roastLines.length)];

    return sendMsg(
`@${targetName} ${randomRoast}`
    );
  }
};
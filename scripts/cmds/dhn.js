module.exports = {
  config: {
    name: "dhn",
    aliases: ["dhn"],
    version: "1.0.2",
    author: "Sazzad",
    countDown: 0,
    role: 0,
    shortDescription: "t = #ttt 100",
    longDescription: "Shudhu t likhle #ttt 100 send hobe",
    category: "GAME",
    guide: { 
      en: "t = #ttt 100" 
    }
  },
  onStart: async function() {},
  onMessage: async function ({ api, event, message }) {
    const OWNER_ID = "61587127840501";
    if(event.senderID != OWNER_ID) return;
    
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
    const text = event.body ? event.body.toLowerCase().trim() : "";
    
    if(text == "t") return sendMsg("#ttt 100");
  }
};
module.exports = {
  config: {
    name: "type",
    aliases: ["type"],
    version: "1.0.0",
    author: "Sazzad",
    countDown: 5,
    role: 0,
    shortDescription: "tumi ja bolbe bot tai type korbe",
    longDescription: "Tumi ja likhba #type er pore bot shetai send korbe",
    category: "FUN",
    guide: {
      en: "{p}type [text]\nEx: {p}type yoo bby"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const sendMsg = (txt) => message && typeof message.reply === "function"
    ? message.reply(txt)
      : api.sendMessage(txt, event.threadID, event.messageID);

    const text = args.join(" ");

    if (!text) {
      return sendMsg("❌ Usage: #type [text]\nExample: #type yoo bby");
    }

    return sendMsg(text);
  }
};
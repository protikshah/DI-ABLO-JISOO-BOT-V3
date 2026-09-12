module.exports = {
config: {
name: "help2",
aliases: ["h2", "smenu"],
version: "1.0",
author: "Sazzad",
countDown: 5,
role: 0,
shortDescription: "Sazzad's Custom Menu",
category: "system",
guide: { en: "{p}help2" }
},

onStart: async function({ message }) {
let menu = `⚡ 𝗦𝗔𝗭𝗭𝗔𝗗𝗦 𝗠𝗘𝗡𝗨 ⚡
⇝━━━━━━━━━━━⇜
╭───↱ 🛡️ 𝐀𝐃𝐌𝐈𝐍↲
↬ antiout
↬ spygc
╰━━━━━━━━⋙
╭───↱ ☃ 𝐁𝐎𝐗 𝐂𝐇𝐀𝐓↲
↬ adduser
↬ badwords
╰━━━━━━━━⋙
╭───↱ 🎮 𝐅𝐔𝐍↲
↬ gayy
↬ lesbian
↬ rate
↬ ship
↬ type
↬ roast
╰━━━━━━━━⋙
╭───↱ 🎲 𝐆𝐀𝐌𝐄↲
↬ c1
↬ guess
↬ heist
↬ scratch
↬ slot3
↬ ttt
↬ Ls
↬ Ls top
╰━━━━━━━━━━━━━━━━⋙
≾━━━━━━━━━━━≿
💡 𝗨𝘀𝗲: #help <command_name> for details
👑 𝗢𝘄𝗻𝗲𝗿: Sazzad`;

return message.reply(menu)
}
};
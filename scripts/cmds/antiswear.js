module.exports = {
config: {
name: "antiswear",
aliases: ["aswear"],
version: "beta",
author: "𝑺𝒂𝒛𝒂𝒅",
countDown: 5,
role: 1,
description: {
vi: "Bật/tắt/thêm/xóa cảnh báo chửi thề, nếu thành viên vi phạm sẽ bị cảnh báo, lần 2 sẽ kick khỏi box chat",
en: "Turn on/off/add/remove swear words warning, if a member violates, he will be warned, the second time he will be kicked out of the chat box"
},
category: "box chat",
guide: {
vi: " {pn} add <words>: thêm từ chửi (có thể thêm nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\"" + "\n {pn} delete <words>: xóa từ chửi (có thể xóa nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\"" + "\n {pn} list <hide | để trống>: tắt cảnh báo (thêm \"hide\" để ẩn từ chửi)" + "\n {pn} unwarn [<userID> | <@tag>]: xóa 1 lần cảnh báo của 1 thành viên" + "\n {pn} on: bật cảnh báo" + "\n {pn} off: tắt cảnh báo",
en: " {pn} add <words>: add swear words (you can add multiple words separated by commas \",\" or vertical bars \"|\")" + "\n {pn} delete <words>: delete swear words (you can delete multiple words separated by commas \",\" or vertical bars \"|\")" + "\n {pn} list <hide | leave blank>: turn off warning (add \"hide\" to hide swear words)" + "\n {pn} unwarn [<userID> | <@tag>]: remove 1 warning of 1 member" + "\n {pn} on: turn on warning" + "\n {pn} off: turn off warning"
}
},
langs: {
vi: {
onText: "bật",
offText: "tắt",
onlyAdmin: "⚠️ | Chỉ quản trị viên mới có thể thêm từ chửi vào danh sách",
missingWords: "⚠️ | Bạn chưa nhập từ cần chặn",
addedSuccess: "✅ | Đã thêm %1 từ chửi vào danh sách",
alreadyExist: "❌ | %1 từ chửi đã tồn tại trong danh sách: %2",
tooShort: "⚠️ | %1 từ chửi không thể thêm vào danh sách do có độ dài nhỏ hơn 2 ký tự: %2",
onlyAdmin2: "⚠️ | Chỉ quản trị viên mới có thể xóa từ chửi khỏi danh sách",
missingWords2: "⚠️ | Bạn chưa nhập từ cần xóa",
deletedSuccess: "✅ | Đã xóa %1 từ chửi khỏi danh sách",
notExist: "❌ | %1 từ chửi không tồn tại trong danh sách: %2",
emptyList: "⚠️ | Danh sách từ chửi trong nhóm bạn hiện đang trống",
swearWordsList: "📑 | Danh sách từ chửi trong nhóm bạn: %1",
onlyAdmin3: "⚠️ | Chỉ quản trị viên mới có thể %1 tính năng này",
turnedOnOrOff: "✅ | Cảnh báo chửi thề đã %1",
onlyAdmin4: "⚠️ | Chỉ quản trị viên mới có thể xóa cảnh báo chửi thề",
missingTarget: "⚠️ | Bạn chưa nhập ID người dùng hoặc tag người dùng",
notWarned: "⚠️ | Người dùng %1 chưa bị cảnh báo chửi thề",
removedWarn: "✅ | Người dùng %1 | %2 đã được xóa bỏ 1 lần cảnh báo chửi thề",
warned: "⚠️ | Từ chửi \"%1\" đã được phát hiện trong tin nhắn của bạn, nếu tiếp tục vi phạm bạn sẽ bị kick khỏi nhóm.",
warned2: "⚠️ | Từ chửi \"%1\" đã được phát hiện trong tin nhắn của bạn, bạn đã vi phạm 2 lần và sẽ bị kick khỏi nhóm.",
needAdmin: "Bot cần quyền quản trị viên để kick thành viên bị ban",
unwarned: "✅ | Đã xóa bỏ cảnh báo chửi thề của người dùng %1 | %2"
},
en: {
onText: "on",
offText: "off",
onlyAdmin: "⚠️ | Only admins can add swear words to the list",
missingWords: "⚠️ | You haven't entered the swear words",
addedSuccess: "✅ | Added %1 swear words to the list",
alreadyExist: "❌ | %1 swear words already exist in the list: %2",
tooShort: "⚠️ | %1 swear words cannot be added to the list because they are shorter than 2 characters: %2",
onlyAdmin2: "⚠️ | Only admins can delete swear words from the list",
missingWords2: "⚠️ | You haven't entered the words to delete",
deletedSuccess: "✅ | Deleted %1 swear words from the list",
notExist: "❌ | %1 swear words do not exist in the list: %2",
emptyList: "⚠️ | The list of swear words in your group is currently empty",
swearWordsList: "📑 | The list of swear words in your group: %1",
onlyAdmin3: "⚠️ | Only admins can %1 this feature",
turnedOnOrOff: "✅ | Swear words warning has been %1",
onlyAdmin4: "⚠️ | Only admins can delete swear words warning",
missingTarget: "⚠️ | You haven't entered user ID or tagged user",
notWarned: "⚠️ | User %1 has not been warned for swear words",
removedWarn: "✅ | User %1 | %2 has been removed 1 swear words warning",
warned: "⚠️ | Swear word \"%1\" have been detected in your message, if you continue to violate you will be kicked from the group.",
warned2: "⚠️ | Swear word \"%1\" have been detected in your message, you have violated 2 times and will be kicked from the group.",
needAdmin: "Bot needs admin privileges to kick banned members",
unwarned: "✅ | Removed swear words warning of user %1 | %2"
}
},
onStart: async function ({ message, event, args, threadsData, usersData, role, getLang }) {
if (!await threadsData.get(event.threadID, "data.antiSwear")) await threadsData.set(event.threadID, { words: [], violationUsers: {} }, "data.antiSwear");
const swearWords = await threadsData.get(event.threadID, "data.antiSwear.words", []);
switch (args) {
case "add": {
if (role < 1) return message.reply(getLang("onlyAdmin"));
const words = args.slice(1).join(" ").split(/[,|]/);
if (words.length === 0) return message.reply(getLang("missingWords"));
const swearWordsExist = [];
const success = [];
const failed = [];
for (const word of words) {
const w = word.toLowerCase().trim();
if (w.length < 2) { failed.push(word); continue; }
const oldIndex = swearWords.indexOf(w);
if (oldIndex === -1) { swearWords.push(w); success.push(word); }
else if (oldIndex > -1) { swearWordsExist.push(word); }
}
await threadsData.set(event.threadID, swearWords, "data.antiSwear.words");
message.reply(
(success.length > 0? getLang("addedSuccess", success.length) : "") +
(swearWordsExist.length > 0? "\n" + getLang("alreadyExist", swearWordsExist.length, swearWordsExist.map(word => hideWord(word)).join(", ")) : "") +
(failed.length > 0? "\n" + getLang("tooShort", failed.length, failed.join(", ")) : "")
);
break;
}
case "delete": case "del": case "-d": {
if (role < 1) return message.reply(getLang("onlyAdmin2"));
const words = args.slice(1).join(" ").split(/[,|]/);
if (words.length === 0) return message.reply(getLang("missingWords2"));
const success = [];
const failed = [];
for (const word of words) {
const w = word.toLowerCase().trim();
const oldIndex = swearWords.indexOf(w);
if (oldIndex > -1) { swearWords.splice(oldIndex, 1); success.push(word); }
else failed.push(word);
}
await threadsData.set(event.threadID, swearWords, "data.antiSwear.words");
message.reply(
(success.length > 0? getLang("deletedSuccess", success.length) : "") +
(failed.length > 0? "\n" + getLang("notExist", failed.length, failed.join(", ")) : "")
);
break;
}
case "list": case "all": case "-a": {
if (swearWords.length === 0) return message.reply(getLang("emptyList"));
message.reply(getLang("swearWordsList", args === "hide"? swearWords.map(word => hideWord(word)).join(", ") : swearWords.join(", ")));
break;
}
case "on": {
if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("onText")));
await threadsData.set(event.threadID, true, "settings.antiSwear");
message.reply(getLang("turnedOnOrOff", getLang("onText")));
break;
}
case "off": {
if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("offText")));
await threadsData.set(event.threadID, false, "settings.antiSwear");
message.reply(getLang("turnedOnOrOff", getLang("offText")));
break;
}
case "unwarn": {
if (role < 1) return message.reply(getLang("onlyAdmin4"));
let userID;
if (Object.keys(event.mentions).length > 0) userID = Object.keys(event.mentions);
else if (args) userID = args;
else if (event.messageReply) userID = event.messageReply.senderID;
if (isNaN(userID)) return message.reply(getLang("missingTarget"));
const violationUsers = await threadsData.get(event.threadID, "data.antiSwear.violationUsers", {});
if (!violationUsers) return message.reply(getLang("notWarned", userID));
violationUsers--;
await threadsData.set(event.threadID, violationUsers, "data.antiSwear.violationUsers");
const userName = await usersData.getName(userID);
message.reply(getLang("unwarned", userID, userName));
break;
}
default: return message.reply("Usage: antiswear add/del/list/on/off/unwarn");
}
},
onChat: async function ({ message, event, api, threadsData, prefix, getLang }) {
if (!event.body) return;
const threadData = global.db.allThreadData.find(t => t.threadID === event.threadID) || await threadsData.create(event.threadID);
const isEnabled = threadData.settings.antiSwear;
if (!isEnabled) return;
const allAliases = [...(global.GoatBot.commands.get("antiswear").config.aliases || []),...(threadData.data.aliases?.["antiswear"] || [])];
const isCommand = allAliases.some(a => event.body.startsWith(prefix + a));
if (isCommand) return;
const swearWordList = threadData.data.antiSwear?.words;
if (!swearWordList || swearWordList.length === 0) return;
const violationUsers = threadData.data.antiSwear?.violationUsers || {};
const msg = event.body.toLowerCase();
for (const word of swearWordList) {
if (msg.match(new RegExp(`\\b${word}\\b`, "gi"))) {
if ((violationUsers[event.senderID] || 0) < 1) {
message.reply(getLang("warned", word));
violationUsers[event.senderID] = violationUsers[event.senderID]? violationUsers[event.senderID] + 1 : 1;
await threadsData.set(event.threadID, violationUsers, "data.antiSwear.violationUsers");
return;
} else {
await message.reply(getLang("warned2", word));
api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
if (err) return message.reply(getLang("needAdmin"));
});
return;
}
}
}
}
};
const hideWord = str => str.length == 2? str + "" : str + "".repeat(str.length - 2) + str[str.length - 1];
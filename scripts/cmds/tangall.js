"use strict";

module.exports = {
	config: {
		name: "tagall",
		aliases: ["mentionall", "everyone"],
		version: "1.0",
		author: "Badhon-00",
		countDown: 10,
		role: 0,
		category: "group",
		description: { en: "Mention every member in the current group." },
		guide: { en: "{pn} [message]" }
	},
	onStart: async ({ api, event, args, message }) => {
		const info = await api.getThreadInfo(event.threadID);
		const members = (info.userInfo || []).filter(user => String(user.id) !== String(api.getCurrentUserID()));
		if (!members.length) return message.reply("No group members were found.");
		const prefix = args.join(" ").trim() || "Hello everyone!";
		return message.send({
			body: `${prefix}\n\n${members.map(user => `@${user.name || "member"}`).join(" ")}`,
			mentions: members.map(user => ({ id: user.id, tag: user.name || "member" }))
		});
	}
};
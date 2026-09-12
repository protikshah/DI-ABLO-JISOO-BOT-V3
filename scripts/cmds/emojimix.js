const axios = require("axios");

const API_BASE = "https://emojimix-api.onrender.com/melissa-api-hub/badhon-00apis/api/melissa";

module.exports = {
	config: {
		name: "emojimix",
		version: "1.4",
		author: "Badhon-00",
		countDown: 5,
		role: 0,
		description: {
			en: "Mix 2 emoji together"
		},
		guide: {
			en: "   {pn} <emoji1> <emoji2>"
				+ "\n   Example:  {pn} 🤣 🥰"
		},
		category: "fun"
	},
	langs: {
		en: {
			error: "Sorry, emoji %1 and %2 can't mix",
			success: "Emoji %1 and %2 mix %3 images"
		}
	},
	onStart: async function ({ message, args, getLang }) {
		const readStream = [];
		const emoji1 = args[0];
		const emoji2 = args[1];
		if (!emoji1 || !emoji2)
			return message.SyntaxError();
		const generate1 = await generateEmojimix(emoji1, emoji2);
		const generate2 = await generateEmojimix(emoji2, emoji1);
		if (generate1)
			readStream.push(generate1);
		if (generate2)
			readStream.push(generate2);
		if (readStream.length == 0)
			return message.reply(getLang("error", emoji1, emoji2));
		message.reply({
			body: getLang("success", emoji1, emoji2, readStream.length),
			attachment: readStream
		});
	}
};

async function generateEmojimix(emoji1, emoji2) {
	try {
		const { data } = await axios.post(`${API_BASE}/mix`, {
			left: emoji1,
			right: emoji2
		});
		if (!data.ok)
			return null;
		const { data: response } = await axios.get(data.url, { responseType: "stream" });
		response.path = `emojimix${Date.now()}.png`;
		return response;
	}
	catch (e) {
		return null;
	}
}
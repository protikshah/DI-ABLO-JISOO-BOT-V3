const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// 🎥 Put your direct mp4 video link here (e.g., https://files.catbox.moe/xxxxxx.mp4)
const HELP_VIDEO_URL = "https://files.catbox.moe/euhp0a.mp4";

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "5.0",
		author: "Protik shah",
		countDown: 3,
		role: 0,
		shortDescription: "Show all available commands",
		longDescription: "Displays a ultra-stylish, categorized list of commands with video attachment support.",
		category: "system",
		guide: "{pn}help [command name]"
	},

	onStart: async function ({ api, message, args, prefix }) {
		const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);
		const allCommands = global.GoatBot.commands;
		const categories = {};

		const emojiMap = {
			ai: "🤖", "ai-image": "🎨", group: "👥", system: "⚙️",
			fun: "🎮", owner: "👑", config: "🛠️", economy: "💰",
			media: "🎥", "18+": "🔞", tools: "🧰", utility: "🔧",
			info: "ℹ️", image: "🖼️", game: "🎲", admin: "🛡️",
			rank: "🏆", boxchat: "💬", others: "📌"
		};

		const cleanCategoryName = (text) => {
			if (!text) return "others";
			return text
				.normalize("NFKD")
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, " ")
				.trim()
				.toLowerCase();
		};

		for (const [name, cmd] of allCommands) {
			const cat = cleanCategoryName(cmd.config.category);
			if (!categories[cat]) categories[cat] = [];
			categories[cat].push(cmd.config.name);
		}

		// Detailed Command Info View
		if (args[0]) {
			const query = args[0].toLowerCase();
			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));
			if (!cmd) return sendMsg(`❌ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 "${query}" 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱.`);

			const {
				name,
				version,
				author,
				guide,
				category,
				shortDescription,
				longDescription,
				aliases,
				role 
			} = cmd.config;

			const desc =
				typeof longDescription === "string"
					? longDescription
					: longDescription?.en || shortDescription?.en || shortDescription || "No description available.";

			const usage =
				typeof guide === "string"
					? guide.replace(/{pn}/g, prefix)
					: guide?.en?.replace(/{pn}/g, prefix) || `${prefix}${name}`;

			const requiredRole = role !== undefined ? role : 0; 
			const roleText = requiredRole === 0 ? "Everyone (Member)" : requiredRole === 1 ? "Group Admin" : "Bot Admin / Owner";

			return sendMsg(
				`⚙️ 𝗦𝗧𝗬𝗟𝗜𝗦𝗛 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ⚙️\n` +
				`━━━━━━━━━━━━━━━━━━━\n` +
				`📌 𝗡𝗮𝗺𝗲: ${name.toUpperCase()}\n` +
				`🏷️ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${(category || "Uncategorized").toUpperCase()}\n` +
				`📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}\n` +
				`🔀 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
				`💡 𝗨𝘀𝗮𝗴𝗲: ${usage}\n` +
				`🔑 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: ${roleText}\n` + 
				`👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${author}\n` +
				`🚀 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: v${version}\n` +
				`━━━━━━━━━━━━━━━━━━━`
			);
		}

		// Main Categorized Help Menu View
		const formatCommands = (cmds) => cmds.sort().map((cmd) => `↬ ${cmd}`);

		let msg = `⚡ 𝗗𝗜𝗔𝗕𝗟𝗢 𝗠𝗘𝗡𝗨 ⚡\n`;
		msg += `⇝━━━━━━━━━━━━━━━━━━━⇜\n`;

		const sortedCategories = Object.keys(categories).sort();
		for (const cat of sortedCategories) {
			const emoji = emojiMap[cat] || "☃";
			msg += `\n╭───↱ ${emoji} ${cat.toUpperCase()}↲ \n`; 
			msg += `${formatCommands(categories[cat]).join("  ")}\n`; 
			msg += `╰━━━━━━━━━━━━━━━━⋙\n`;
		}

		msg += `\n≾━━━━━━━━━━━━━━━━━━━≿\n`;
		msg += `💡 𝗨𝘀𝗲: ${prefix}help <command_name> for detailed usage.\n`;
		msg += `📞 𝗨𝘀𝗲: ${prefix}callad to talk directly with my boss DI-ABLO.`;

		// Handle Media Attachment (Video)
		if (HELP_VIDEO_URL && HELP_VIDEO_URL.trim() !== "") {
			const cacheDir = path.join(__dirname, "cache");
			await fs.ensureDir(cacheDir);
			const videoPath = path.join(cacheDir, `help_menu_${Date.now()}.mp4`);

			try {
				const res = await axios({ url: HELP_VIDEO_URL, responseType: "stream" });
				const writer = fs.createWriteStream(videoPath);
				res.data.pipe(writer);

				await new Promise((resolve, reject) => {
					writer.on("finish", resolve);
					writer.on("error", reject);
				});

				const payload = {
					body: msg,
					attachment: fs.createReadStream(videoPath)
				};

				const callback = () => { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); };
				return message && typeof message.reply === "function" 
					? message.reply(payload, callback) 
					: api.sendMessage(payload, event.threadID, callback, event.messageID);

			} catch (err) {
				console.error("Help video attachment failed, sending text only:", err);
				if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
				return sendMsg(msg);
			}
		} else {
			return sendMsg(msg);
		}
	}
};

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp"],
    version: "1.3",
    author: "BADHON",
    countDown: 5,
    role: 0,
    shortDescription: "PROFILE image",
    longDescription: "Get profile picture with auto mention",
    category: "image",
    guide: {
      en: "{pn} @tag / reply / uid"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      let targetID;


      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      }

      else if (Object.keys(event.mentions || {}).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
  
      else if (event.body && /^\d{5,}$/.test(event.body.trim())) {
        targetID = event.body.trim();
      }

      else {
        targetID = event.senderID;
      }


      const targetName = await usersData.getName(targetID);

      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=1024&height=1024&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      return message.reply({
        body: `👤 Name: ${targetName}\n🆔 UID: ${targetID}`,
        mentions: [
          {
            tag: targetName,
            id: targetID
          }
        ],
        attachment: await global.utils.getStreamFromURL(avatarURL)
      });

    } catch (err) {
      console.error("Profile command error:", err);
      return message.reply("❌ Failed to fetch profile picture.");
    }
  }
};
const { pnix, parsedJid } = require('../lib');
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

pnix(
  {
    pattern: "setpp",
    fromMe: true,
    type: "owner",
  },
  async (message, match, m) => {
    if (!message.reply_message.image)
      return await message.reply("_Reply To A Photo_");
    let buff = await m.quoted.download();
    await message.setPP(message.user, buff);
    return await message.reply("_Profile Picture Updated ✅_");
  }
);

pnix(
  {
    pattern: "setname",
    fromMe: true,
    type: "owner",
  },
  async (message, match, m) => {
    if (!match) return await message.reply(`_Enter A Text_\n_📌 Example: *${m.prefix}setname Phoenix-MD*_`);
    await message.updateName(match);
    return await message.reply(`_Username Updated To: ${match} ✅_`);
  }
);

pnix(
  {
    pattern: "block",
    fromMe: true,
    type: "owner",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply To A Person/Mention_");
      await message.block(jid);
      return await message.sendMessageMessage(`_@${jid.split("@")[0]} Blocked ✅_`, {
        mentions: [jid],
      });
    } else {
      await message.block(message.jid);
      return await message.reply("_User Blocked ✅_");
    }
  }
);

pnix(
  {
    pattern: "unblock",
    fromMe: true,
    type: "owner",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply To A Person Or Mention_");
      await message.block(jid);
      return await message.sendMessage(`_@${jid.split("@")[0]} Unblocked ✅_`, {
        mentions: [jid],
      });
    } else {
      await message.unblock(message.jid);
      return await message.reply("_User Unblocked ✅_");
    }
  }
);

pnix(
  {
    pattern: "jid",
    fromMe: true,
    type: "owner",  
  },
  async (message, match) => {
    return await message.sendMessage(
      message.mention[0] || message.reply_message.jid || message.jid
    );
  }
);

pnix(
  {
    pattern: "dlt",
    fromMe: true,
    type: "owner", 
  },
  async (message, match, m, client) => {
      client.sendMessage(message.jid, { delete: message.reply_message.key })
  }
);

// Send spam messages
pnix({
  pattern: "spam",
  fromMe: true,
  desc: "Send a message multiple times",
  type: "owner"
}, async (message, match, m) => {

  if (!match) {
    return await message.reply(`_Enter A Text To Repeat_\n_📌 Example: *${m.prefix}spam I M Phoenix-MD;3*_\n\n◕ ⚠️ *ᴅᴏɴᴛ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴛᴏᴏ ᴍᴜᴄʜ ɪᴛ ᴍᴀʏ ʙᴀɴ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ*`);
  }

  const [content, countStr] = match.split(';');
  const count = parseInt(countStr) || Config.SPAM_COUNT;

  if (isNaN(count) || count < 1) {
    return await message.reply(`_Enter A Valid Repeat Count_\n_📌 Example: *${m.prefix}spam I M Phoenix-MD;3*_`);
  }

  for (let i = 0; i < count; i++) {
    await message.reply(content.trim());
  }
});

pnix({
  pattern: 'vv',
  fromMe: true,
  type: "owner"
}, async (message, match, m) => {
  if (!message.reply_message || !m.quoted.message.viewOnceMessageV2 && !m.quoted.message.viewOnceMessageV2Extension) {
    return await message.reply("_Reply To A View Once Message_");
  }
  
  const mediaMessage = m.quoted.message.viewOnceMessageV2Extension || m.quoted.message.viewOnceMessageV2;
  const mediaBuffer = await downloadMediaMessage(mediaMessage, "buffer", {}, { reuploadRequest: message.client.updateMediaMessage });

  if (quoted.quoted.message.viewOnceMessageV2Extension) {
    await message.client.sendMessage(message.jid, { audio: mediaBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
  } else {
    await message.sendFile(mediaBuffer);
  }
});

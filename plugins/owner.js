const { pnix, parsedJid } = require('../lib');
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const config = require("../config");
const { exec } = require("child_process");
const simplegit = require("simple-git");
const git = simplegit();
const BRANCH = config.BRANCH;
const PROCESSNAME = "Phoenix-MD";

pnix(
  {
    pattern: "update",
    fromMe: true,
    desc: "Update the bot",
    type: "user",
  },
  async (message, match, m) => {
    await exec(`git config user.name "AbhishekSuresh2"`);
    await exec(`git config user.email "AbhishekSuresh2030@gmail.com"`);

    await git.fetch();
    const commits = await git.log([`${BRANCH}..origin/${BRANCH}`]);

    if (match === "now") {
      if (commits.total === 0) {
        return await message.reply(
          "_*ᴘʜᴏᴇɴɪx-ᴍᴅ ɪꜱ ᴀʟʀᴇᴀᴅʏ ᴏɴ ᴛʜᴇ ʟᴀᴛᴇꜱᴛ ᴠᴇʀꜱɪᴏɴ*_"
        );
      }
      await message.reply("_*ᴜᴘᴅᴀᴛɪɴɢ ᴘʜᴏᴇɴɪx-ᴍᴅ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...*_");
      await exec(`git stash && git pull origin ${BRANCH}`, async (err, stdout, stderr) => {
        if (err) {
          return await message.reply(`\`\`\`${stderr}\`\`\``);
        }
        await message.reply("_*ᴘʜᴏᴇɴɪx-ᴍᴅ ᴜᴘᴅᴀᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ!*\n_*ʀᴇꜱᴛᴀʀᴛɪɴɢ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...*_");

        const dependencyUpdated = await updatedDependencies();
        const restartCommand = dependencyUpdated ? 
          `npm install && pm2 restart ${PROCESSNAME}` : 
          `pm2 restart ${PROCESSNAME}`;

        exec(restartCommand, async (err, stdout, stderr) => {
          if (err) {
            return await message.reply(`\`\`\`${stderr}\`\`\``);
          }
          await message.reply("_*ʀᴇꜱᴛᴀʀᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ*_");
        });
      });
    } else {
      if (commits.total === 0) {
        return await message.reply(
          "_*ᴘʜᴏᴇɴɪx-ᴍᴅ ɪꜱ ᴀʟʀᴇᴀᴅʏ ᴏɴ ᴛʜᴇ ʟᴀᴛᴇꜱᴛ ᴠᴇʀꜱɪᴏɴ*_"
        );
      } else {
        let changes = "*ɴᴇᴡ ᴜᴘᴅᴀᴛᴇ ɪꜱ ᴀᴠᴀɪʟᴀʙʟᴇ ꜰᴏʀ ᴘʜᴏᴇɴɪx-ᴍᴅ*\n\n";
        commits.all.forEach((commit, index) => {
          changes += `${index + 1} ●  Uᴘᴅᴀᴛᴇ ${commit.message}\n`;
        });
        changes += `\n _ᴛʏᴘᴇ *${m.prefix}update now* ᴛᴏ ᴜᴘᴅᴀᴛᴇ_`;
        await message.reply(changes);
      }
    }
  }
);

async function updatedDependencies() {
  try {
    const diff = await git.diff([`${BRANCH}..origin/${BRANCH}`]);
    return diff.includes('"dependencies":');
  } catch (error) {
    console.error("Error occurred while checking package.json:", error);
    return false;
  }
}

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
  const count = parseInt(countStr) || config.SPAM_COUNT;

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

  if (m.quoted.message.viewOnceMessageV2Extension) {
    await message.client.sendMessage(message.jid, { audio: mediaBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
  } else {
    await message.sendFile(mediaBuffer);
  }
});

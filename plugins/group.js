const config = require("../config");
const { pnix, isPrivate, isAdmin, parsedJid, isUrl } = require("../lib/");

pnix({
    pattern: 'invite',
    fromMe: isPrivate,
    desc: "Provides the group's invitation link.",
    type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_* I M Not An Admin!*_");
    const data = await message.client.groupInviteCode(message.jid);
    const metadata = await message.client.groupMetadata(message.jid);
    const { subject } = metadata;
    return await message.reply(`╭───❮ *ɢʀᴏᴜᴘ ʟɪɴᴋ* ❯\n│  *ɢʀᴏᴜᴘ:* ${subject}\n│  *ʟɪɴᴋ:* https://chat.whatsapp.com/${data}\n╰─────────────⦁`);
});

pnix({
    pattern: 'revoke',
    fromMe: true,
    desc: "Revoke Group invite link.",
    type: 'group'
}, async (message) => {
    if (!message.isGroup)
    return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_* I M Not An Admin!*_");
    await message.client.groupRevokeInvite(message.jid);
    const data = await message.client.groupInviteCode(message.jid);
    const metadata = await message.client.groupMetadata(message.jid);
    const { subject } = metadata;
    await message.reply(`╭───❮ *ɢʀᴏᴜᴘ ʟɪɴᴋ ʀᴇꜱᴇᴛᴇᴅ* ❯\n│  *ɢʀᴏᴜᴘ:* ${subject}\n│  *ɴᴇᴡ ɢʀᴏᴜᴘ  ʟɪɴᴋ:* https://chat.whatsapp.com/${data}\n╰─────────────⦁`);
});

pnix({
	pattern: 'left',
	fromMe: true,
	desc: 'Left from group',
	type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    await message.client.groupLeave(message.jid);
});

pnix({
    pattern: 'join',
    fromMe: true,
    desc: "to join a group",
    type: 'group'
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply('_Enter a valid group link!_');
    if (!isUrl(match)) return await message.send('_Enter a valid group link!_');

    // Extract URL using a custom function
    const matchUrl = extractUrlFromMessage(match);
    if (!matchUrl) return await message.send('_Enter a valid group link!_');

    if (matchUrl && matchUrl.includes('chat.whatsapp.com')) {
        const groupCode = matchUrl.split('https://chat.whatsapp.com/')[1];
        const joinResult = await message.client.groupAcceptInvite(groupCode);

        if (joinResult) {
            await message.reply('_Joined!_'); 
        } else {
            await message.reply('_Invalid Group Link!_'); 
        }
    } else {
        await message.reply('_Invalid Group Link!_'); 
    }
});

// Function to extract URL from text
function extractUrlFromMessage(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlPattern);
    return urls ? urls[0] : null;
}


pnix(
  {
    pattern: "add",
    fromMe: true,
    desc: "add a person to group",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups!*_");

    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention a User To Add_");

    const isadmin = await isAdmin(message.jid, message.user, message.client);

    if (!isadmin) return await message.reply("*_I M Not An Admin_*");
    const jid = parsedJid(match);

    await message.client.groupParticipantsUpdate(message.jid, jid, "add");

    return await message.reply(`_Added *@${jid[0].split("@")[0]}* To This Group ✅_`, {
      mentions: [jid],
    });
  }
);

pnix(
  {
    pattern: "kick",
    fromMe: true,
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups!*_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_*I M Not An Admin!*_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention a User To Kick_");
    let jid = parsedJid(match);
    await message.kick(jid);
    return await message.reply(`_Removed *@${jid[0].split("@")[0]}* From This Group ✅_`, {
      mentions: jid,
    });
  }
);

pnix(
  {
    pattern: "promote",
    fromMe: true,
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups*_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("*_I M Not An Admin_*");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention A User To Promote As Admin_");
    let jid = parsedJid(match);
    await message.promote(jid);
    return await message.reply(`_*@${jid[0].split("@")[0]}* Promoted As An Admin ✅_`, {
      mentions: jid,
    });
  }
);

pnix(
  {
    pattern: "demote",
    fromMe: true,
    desc: "demote a member",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups!*_");
    match = match || message.reply_message.jid;
    if (!match) return await message.reply("_Mention A User To Demote From Admin_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    let jid = parsedJid(match);
    await message.demote(jid);
    return await message.reply(`_*@${jid[0].split("@")[0]}* Demoted From Admin ✅_`, {
      mentions: jid,
    });
  }
);

/**
 * antilink
*/
pnix(
  {
    on: "text",
  },
  async (message, match) => {
    if (!message.isGroup) 
    if (config.ANTILINK)
      if (isUrl(match)) {
        await message.reply("_Link Detected_");
        let botadmin = await isAdmin(message.jid, message.user, message.client)
        let senderadmin = await isAdmin(message.jid, message.participant, message.client)
        if (botadmin) {
          if (!senderadmin){
          await message.reply(
            `_Commencing Specified Action: *${config.ANTILINK_ACTION}*_`
          );
          return await message[config.ANTILINK_ACTION]([message.participant]);
        }} else {
          return await message.reply("_*I M Not An Admin!*_");
        }
      }
  }
);

pnix(
  {
    pattern: "tagall",
    fromMe: isPrivate,
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup)
    return await message.reply("_*This Command Is Only For Groups!*_");
    const { participants } = await message.client.groupMetadata(message.jid);
    let teks = "";
    for (let mem of participants) {
      teks += ` @${mem.id.split("@")[0]}\n`;
    }
    message.sendMessage(teks.trim(), {
      mentions: participants.map((a) => a.id),
    });
  }
);

pnix(
  {
    pattern: "gjid",
    fromMe: isPrivate,
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups!*_");
    let { participants } = await client.groupMetadata(message.jid);
    let participant = participants.map((u) => u.id);
    let str = "╭───❮ *ɢʀᴏᴜᴘ ᴊɪᴅs* ❯\n";
    participant.forEach((result) => {
      str += `│  *${result}*\n`;
    });
    str += `╰─────────────⦁`;
    message.reply(str);
  }
);

pnix({
    pattern: "mute",
    fromMe: true,
    desc: "Mute group",
    type: "group"
}, async (message, match, m, client) => {
    if (!message.isGroup) {
        return await message.reply("_*This Command Is Only For Groups!*_");
    }

    if (!isAdmin(message.jid, message.user, client)) {
        return await message.reply("_*I M Not An Admin!*_");
    }

    await message.reply("_Muting Group..._");
    await client.groupSettingUpdate(message.jid, "announcement", isPrivate);
});

pnix(
  {
    pattern: "unmute",
    fromMe: true,
    desc: "unmute group",
    type: "group",
  },
  async (message, match, m, client) => {
    if (!message.isGroup)
      return await message.reply("_*This Command Is Only For Groups!*_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_*I M Not An Admin!*_");
    await message.reply("_Unmuting Group..._");
    return await client.groupSettingUpdate(message.jid, "not_announcement");
  }
);

pnix(
  {
      pattern: "ginfo",
      fromMe: isPrivate,
      desc: "group info",
      type: "group",
  },
  async (message, match, client) => {
      try {
          if (!message.isGroup) return message.reply("_*This Command Is Only For Groups!*_");
  
          const metadata = await message.client.groupMetadata(message.jid);

          const { id, subject, owner, creation, size, desc, participants } = metadata;

          const created = msToDateTime(creation);

          let adminsCount = 0;
          let nonAdminsCount = 0;
  
          participants.forEach(participant => {
              if (participant.admin) {
                  adminsCount++;
              } else {
                  nonAdminsCount++;
              }
          });
          const creatorAdmin = participants.find(participant => participant.admin === "superadmin");
        const creatorAdminPhone = creatorAdmin ? "@"+creatorAdmin.id.split("@")[0] : "Not Found!";
            // Format description
    const description = desc ? desc : "No Description";
        // Format owner ID
        const ownerId = owner ? "@"+owner.split("@")[0] : "Not Found!";

          let msg = `*ℹ️ Group Info:*
- Subject: ${subject}
- Creator: ${ownerId}
- Created On: ${created}
- Super Admin: ${creatorAdminPhone}
- Total Number of Participants: ${participants.length}
- Number of Admins: ${adminsCount}
- Number of Participants: ${nonAdminsCount}

- Description: ${description}`;

const jid = parsedJid(msg);
return await message.reply(msg,{
  mentions: [jid],
}
);

      } catch (error) {
          console.error("[Error]:", error);
          return await message.reply("_Error occurred while fetching group info_");
      }
  });

function msToDateTime(ms) {
  const date = new Date(ms * 1000); // convert seconds to milliseconds
  const dateString = date.toDateString();
  const timeString = date.toTimeString().split(' ')[0]; // Removing timezone info
  return dateString + ' ' + timeString;
}

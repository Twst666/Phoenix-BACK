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
    return await message.reply(`https://chat.whatsapp.com/${data}`);
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

pnix({
    pattern: "tag",
    fromMe: true,
    desc: "mention all users in the group",
    type: "group",
}, async (message, match, m) => {
    if (!message.isGroup) 
    return await message.reply("_*This Command Is Only For Groups!*_");
    const { participants } = await message.client.groupMetadata(message.from).catch(e => {});
    let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
    let msg = "";
    if (match === "all" || match === "everyone") {
        for (let i = 0; i < participants.length; i++) {
            msg += `${i + 1}. @${participants[i].id.split('@')[0]}\n`;
        }
        await message.send(msg, { mentions: participants.map(a => a.id) });
    } 
    else if (match === "admin" || match === "admins") {
        for (let i = 0; i < admins.length; i++) {
            msg += `${i + 1}. @${admins[i].split('@')[0]}\n`;
        }
        return await message.send(msg, { mentions: participants.map(a => a.id) });
    } 
    else if (match === "me" || match === "mee") {
        await message.client.sendMessage(message.chat, { text: `@${message.sender.split("@")[0]}`, mentions: [message.sender] });
    } 
    else if (match || message.reply_message.text) {
        match = match || message.reply_message.text;
        if (!match) return await message.reply(`_Reply To A Message_\n_📌 Example:\n_*${m.prefix}tag all*_\n_*${m.prefix}tag admin*_\n_*${m.prefix}tag text*_`);
        await message.send(match, { mentions: participants.map(a => a.id) });
    } 
    else if (message.reply_message.i) {
        return await message.client.forwardMessage(message.jid, message.reply_message.message, { contextInfo: { mentionedJid: participants.map(a => a.id) } });
    } 
    else {
        return await message.reply(`_Reply To A Message_\n_📌 Example:\n_*${m.prefix}tag all*_\n*_${m.prefix}tag admin*_\n*_${m.prefix}tag text*_`);
    }
});

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

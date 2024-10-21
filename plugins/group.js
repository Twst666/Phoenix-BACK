const config = require("../config");
const { pnix, isPrivate, isAdmin, parsedJid, isUrl } = require("../lib/");
const Jimp = require("jimp");
						  
pnix({
    pattern: 'invite',
    fromMe: isPrivate,
    desc: "Provides the group's invitation link.",
    type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
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
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    await message.client.groupRevokeInvite(message.jid);
    const data = await message.client.groupInviteCode(message.jid);
    const metadata = await message.client.groupMetadata(message.jid);
    const { subject } = metadata;
    await message.reply(`╭───❮ *ɢʀᴏᴜᴘ ʟɪɴᴋ ʀᴇꜱᴇᴛᴇᴅ* ❯\n│  *ɢʀᴏᴜᴘ:* ${subject}\n│  *ɴᴇᴡ ɢʀᴏᴜᴘ  ʟɪɴᴋ:* https://chat.whatsapp.com/${data}\n╰─────────────⦁`);
});

pnix({
    pattern: "gpp",
    fromMe: true,
    desc: "Set full-screen profile picture",
    type: "group",
}, async (message, match, m) => {  
    if (!message.isGroup)
    return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    if(match && match === "remove") {
        await message.client.removeProfilePicture(message.jid);
        return await message.reply("_Group Profile Picture Removed Successfully ✅_");
    }
    if (!message.reply_message?.image) return await message.reply("_Reply To A Photo_");
    const media = await m.quoted.download();
    await message.client.updateProfilePicture(message.jid, media);
    return await message.reply("_Group Profile Picture Updated Successfully ✅_");
});

async function updateProfilePicture(jid, imag, message) {
  const { query } = message.client;
  const { img } = await generateProfilePicture(imag);
  await query({
    tag: "iq",
    attrs: {
      to: jid,
      type: "set",
      xmlns: "w:profile:picture",
    },
    content: [
      {
        tag: "picture",
        attrs: { type: "image" },
        content: img,
      },
    ],
  });
}

async function generateProfilePicture(buffer) {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(324, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
  };
}

pnix({
	pattern: 'gname',
	fromMe: true,
	desc: "To change the group's subject",
	type: 'group'
}, async (message, match, m) => {
    if(!message.isGroup)
     return await message.reply("_*This Command Is Only For Groups!*_");
	match = match || message.reply_message.text;
	if (!match) return await message.reply(`_Enter A Group Name_\n_📌 Example: *${m.prefix}gname Phoenix-MD Test Group*_`)
	const meta = await message.client.groupMetadata(message.jid);
	if (!meta.restrict) {
		await message.client.groupUpdateSubject(message.jid, match)
		return await message.reply("_Group Description Updated Successfully ✅_")
	}
	let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
	await client.groupUpdateSubject(message.jid, match)
	return await message.reply("_Group Name Updated Successfully ✅_")
});

pnix({
    pattern: 'gdesc',
    fromMe: true,
    desc: "To change the group's description",
    type: 'group'
}, async (message, match, m) => {
    match = match || message.reply_message.text;
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    if (!match) return await message.reply(`_Enter A Group Description_\n_📌 Example: *${m.prefix}gdesc Welcome To Phoenix-MD Test Group*_`)
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) {
      await message.client.groupUpdateDescription(message.jid, match)
      return await message.reply("_Group Description Updated Successfully ✅_")
    }
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    await message.client.groupUpdateDescription(message.jid, match)
    return await message.reply("_Group Description Updated Successfully ✅_")
})

pnix({
    pattern: 'lock',
    fromMe: true,
    desc: "only allow admins to modify the group's settings",
    type: 'group'
}, async (message, match) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    const meta = await message.client.groupMetadata(message.jid)
    if (meta.restrict) return await message.reply("_Group Is Already *Locked*_")
    await message.client.groupSettingUpdate(message.jid, 'locked')
    return await message.reply("_Group *Locked* Successfully ✅_\n_Now Only Admins Can Modify The Group Settings_")
});

pnix({
    pattern: 'unlock ?(.*)',
    fromMe: true,
    desc: "allow everyone to modify the group's settings",
    type: 'group'
}, async (message, match) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) return await message.reply("_Group Is Already *Unlocked*_")
    await message.client.groupSettingUpdate(message.jid, 'unlocked')
    return await message.reply("_Group *Unlocked* Successfully ✅_\n_Now Everyone Can Modify The Group Settings_")
});

pnix({
	pattern: 'left',
	fromMe: true,
	desc: 'Left from group',
	type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_*This Command Is Only For Groups!*_");
    await message.reply("_*👋 GoodBye Guys I M Leaving This Group*_");
    await message.client.groupLeave(message.jid);
});

pnix({
    pattern: 'join',
    fromMe: true,
    desc: "to join a group",
    type: 'group'
}, async (message, match, m) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply(`_Enter A Group Link_\n_📌 Example: *${m.prefix}join https://chat.whatsapp.com/BOLb0ICN3sAJ5dloRBw5VD*_`);
    if (!isUrl(match)) return await message.reply(`_Enter A Valid Group Link_\n_📌 Example: *${m.prefix}join https://chat.whatsapp.com/BOLb0ICN3sAJ5dloRBw5VD*_`);

    // Extract URL using a custom function
    const matchUrl = extractUrlFromMessage(match);
    if (!matchUrl) return await message.reply(`_Enter A Valid Group Link_\n_📌 Example: *${m.prefix}join https://chat.whatsapp.com/BOLb0ICN3sAJ5dloRBw5VD*_`);

    if (matchUrl && matchUrl.includes('chat.whatsapp.com')) {
        const groupCode = matchUrl.split('https://chat.whatsapp.com/')[1];
        const joinResult = await message.client.groupAcceptInvite(groupCode);

        if (joinResult) {
            await message.reply('_I Have Successfully Joined The Group ✅_'); 
        } else {
            await message.reply('_Invalid Group Link_'); 
        }
    } else {
        await message.reply('_Invalid Group Link_'); 
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

    if (!isadmin) return await message.reply("_*I M Not An Admin!*_");
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
      return await message.reply("_*This Command Is Only For Groups!*_");
    if (!isAdmin(message.jid, message.user, message.client))
      return await message.reply("_*I M Not An Admin!*_");
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
        const ownerId = owner ? "@"+owner.split("@")[0] : "Not Found";

          let msg = `╭───❮ *ɢʀᴏᴜᴘ ʟɪɴᴋ ʀᴇꜱᴇᴛᴇᴅ* ❯\n│  *ɢʀᴏᴜᴘ ɴᴀᴍᴇ:* ${subject}\n│  *ᴄʀᴇᴀᴛᴏʀ:* ${ownerId}\n│  *ᴄʀᴇᴀᴛᴇᴅ ᴏɴ:* ${created}\n│  *sᴜᴘᴇʀ ᴀᴅᴍɪɴ:* ${creatorAdminPhone}\n│  *ᴛᴏᴛᴀʟ ɴᴏ ᴏғ ᴍᴇᴍʙᴇʀs:* ${participants.length}\n│  *ɴᴜᴍʙᴇʀ ᴏғ ᴀᴅᴍɪɴs:* ${adminsCount}\n│  *ɴᴜᴍʙᴇʀ ᴏғ ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs:* ${nonAdminsCount}\n│\n│  *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:* ${description}\n╰─────────────⦁`;

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

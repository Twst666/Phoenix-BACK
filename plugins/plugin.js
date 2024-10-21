const {
  pnix,
  getBuffer,
} = require("../lib");
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const { PluginDB, installPlugin } = require("../lib/database/plugins");
const got = require("got");
const X = require("../config");

pnix({
  pattern: "plugin ?(.*)",
  fromMe: true,
  type: "owner"
}, async (message, match) => {
  const url = match || message.reply_message.text;
  if (!url) return await message.reply("_Enter A Plugin Url_");

  let pluginUrl;
  try {
    const parsedUrl = new URL(url);
    pluginUrl = (parsedUrl.host === "gist.github.com")
      ? `https://gist.githubusercontent.com${parsedUrl.pathname}/raw`
      : parsedUrl.toString();
  } catch (error) {
    console.error(error);
    return await message.reply("_Invalid Plugin Url_");
  }

  try {
    const { body, statusCode } = await got(pluginUrl);
    if (statusCode !== 200) throw new Error("Failed to fetch plugin");

    let pluginName = (body.match(/(?<=pattern:)\s*["'](.*?)["']/) || [])[1]?.trim();
    pluginName = pluginName || `plugin_${Math.random().toString(36).substr(2, 8)}`;

    fs.writeFileSync(`${__dirname}/${pluginName}.js`, body);

    try {
      require(`./${pluginName}`);
      await installPlugin(pluginUrl, pluginName);
      await message.reply(`_Newly Installed Plugins Are: *${pluginName}*_`);
    } catch (error) {
      fs.unlinkSync(`${__dirname}/${pluginName}.js`);
      await message.reply(`Invalid Plugin\n \`\`\`${error}\`\`\``);
    }
  } catch (error) {
    await message.reply(`Error: ${error.message}`);
  }
});

pnix({
  pattern: "allplugin",
  fromMe: true,
  desc: "To get all external plugins of Phoenix-MD",
  type: "owner"
}, async (message, match, m) => {
  try {
    const response = await axios.get(`${X.BASE_URL}api/phoenix/allplugin`);
    const plugins = response.data;

    const pluginList = Object.entries(plugins)
      .map(([name, { url }]) => `*${name}:* ${url}`)
      .join("\n\n");

    const thumbnail = await getBuffer("https://i.ibb.co/tHWJrz3/IMG-20231128-WA0005.jpg");

    const replyMessage = {
      text: pluginList,
      contextInfo: {
        externalAdReply: {
          title: "ᴘʜᴏᴇɴɪx-ᴍᴅ ᴇxᴛᴇʀɴᴀʟ ᴘʟᴜɢɪɴꜱ",
          body: "ʙʏ ᴀʙʜɪꜱʜᴇᴋ ꜱᴜʀᴇꜱʜ",
          thumbnail: thumbnail,
          mediaType: 1,
          mediaUrl: "https://github.com/AbhishekSuresh2/Phoenix-Bot",
          sourceUrl: "https://github.com/AbhishekSuresh2/Phoenix-Bot",
          showAdAttribution: false
        }
      }
    };

    await message.client.sendMessage(message.jid, replyMessage, { quoted: m });
  } catch (error) {
    console.error("Error fetching plugin data:", error);
    await message.reply("Error fetching plugin data");
  }
});

pnix({
  pattern: "listplugin",
  fromMe: true,
  desc: "Plugin list",
  type: "owner"
}, async (message, match, m) => {
  const plugins = await PluginDB.findAll();
  if (!plugins.length) {
    return await message.reply(`_No External Plugins Installed Yet_\n_📌 For External Plugins Type *${m.prefix}allplugin*_`);
  }

  const pluginList = plugins.map(plugin => `\`\`\`${plugin.dataValues.name}\`\`\`: ${plugin.dataValues.url}`).join("\n");
  await message.sendMessage(pluginList);
});

pnix({
  pattern: "remove(?: |$)(.*)",
  fromMe: true,
  type: "owner"
}, async (message, match, m) => {
  const pluginName = match;
  if (!pluginName) {
    return await message.reply(`_Enter The Name Of The Plugin You Want To Remove_\n_📌 Example: *${m.prefix}remove astatus*_`);
  }

  const plugin = await PluginDB.findOne({ where: { name: pluginName } });
  if (!plugin) {
    return await message.reply("_No Plugin Found_");
  }

  await plugin.destroy();
  delete require.cache[require.resolve(`./${pluginName}.js`)];
  fs.unlinkSync(`${__dirname}/${pluginName}.js`);

  await message.reply(`_Plugin: *${pluginName}* Deleted Successfully ✅_\n_*Restarting...*_`);

  exec(`pm2 restart Phoenix-MD`, (err, stdout, stderr) => {
    if (err) {
      return message.reply(`\`\`\`${stderr}\`\`\``); 
    }

    message.reply(`_Phoenix-MD Restarted Successfully ✅_`);
  });
});


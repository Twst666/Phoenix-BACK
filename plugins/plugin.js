const {
  pnix,
  getBuffer,
} = require("../lib");
const axios = require("axios");
const fs = require('fs');
const { PluginDB, installPlugin } = require("../lib/database/plugins");
const got = require("got");
const X = require("../config");

pnix({
    pattern: "plugin",
    fromMe: true,
    desc: "Set full-screen profile picture",
    type: "group",
}, async (message, match, m) => {
    // Get the URL from the match or the replied message text
    const url = match || message.reply_message.text;
    if (!url) return await message.reply(`_Enter A Plugin Url/📌 Use ${m.prerix}plugin list To See Installed Plugins_`);

    let pluginUrl;
    try {
        const parsedUrl = new URL(url);
        // Construct the plugin URL based on the host
        pluginUrl = (parsedUrl.host === "gist.github.com")
            ? `https://gist.githubusercontent.com${parsedUrl.pathname}/raw`
            : parsedUrl.toString();
    } catch (error) {
        console.error(error);
        return await message.reply("_Invalid Plugin Url_");
    }

    try {
        // Fetch the plugin using 'got'
        const { body, statusCode } = await got(pluginUrl);
        if (statusCode !== 200) throw new Error("Failed to fetch plugin");

        // Extract the plugin name from the body
        let pluginName = (body.match(/(?<=pattern:)\s*["'](.*?)["']/) || [])[1]?.trim();
        pluginName = pluginName || `plugin_${Math.random().toString(36).substr(2, 8)}`;

        // Write the plugin to a file
        fs.writeFileSync(`${__dirname}/${pluginName}.js`, body);

        try {
            // Require the new plugin
            require(`./${pluginName}`);
            await installPlugin(pluginUrl, pluginName);
            await message.sendMessage(`_Newly Installed Plugins Are: *${pluginName}*_`);
        } catch (error) {
            fs.unlinkSync(`${__dirname}/${pluginName}.js`); // Clean up if there's an error
            await message.sendMessage(`Invalid Plugin\n\`\`\`${error}\`\`\``);
        }

        // Handle the case where 'match' is 'list'
        if (match && match === "list") {
            await message.client.removeProfilePicture(message.jid);
            return await message.reply("_Group Profile Picture Removed_");
        }

        // Retrieve all installed plugins from the database
        const plugins = await PluginDB.findAll();
        if (!plugins.length) {
            return await message.reply(`_No External Plugins Installed Yet_\n📌 For External Plugins Type ${m.prefix}allplugin_`);
        }

        // Create a list of installed plugins
        const pluginList = plugins.map(plugin => `\`\`\`${plugin.dataValues.name}\`\`\`: ${plugin.dataValues.url}`).join("\n");
        await message.sendMessage(pluginList);
    } catch (error) {
        console.error("Error processing the plugin:", error);
        await message.reply("_An error occurred while processing the plugin._");
    }
});


pnix({
  pattern: "remove(?: |$)(.*)",
  fromMe: true,
  type: "owner"
}, async (message, match, m) => {
 const pluginName = match;
  if (!pluginName) return await message.sendMessage(`_Enter The Name Of The Plugin You Want To Remove_\n📌 Example: ${m.prefix}remove astatus`);

  const plugin = await PluginDB.findOne({ where: { name: pluginName } });
  if (!plugin) return await message.sendMessage("_No Plugin Found_");

  await plugin.destroy();
  delete require.cache[require.resolve(`./${pluginName}.js`)];
  fs.unlinkSync(`${__dirname}/${pluginName}.js`);
  await message.sendMessage(`_Plugin *${pluginName}* Deleted Successfully ✅_\n_Restarting Bot..._`);
});

pnix({
  pattern: "allplugin",
  fromMe: true,
  desc: "To get all plugins of Phoenix-MD",
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
          mediaUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
          sourceUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
          showAdAttribution: false
        }
      }
    };

    await message.client.sendMessage(message.jid, replyMessage, { quoted: message });
  } catch (error) {
    console.error("Error fetching plugin data:", error);
    await message.client.sendMessage(message.jid, "Error fetching plugin data", { quoted: m });
  }
});

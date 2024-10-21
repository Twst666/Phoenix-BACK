const {
  pnix,
  isPrivate,
  sleep,
  getJson,
  getBuffer,
  Function
} = require("../lib/");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const axios = require('axios');
const Config = require("../config");
const X = require("../config");
var videotime = 60000; // 1000 min
var dlsize = 1000; // 1000mb

pnix(
  {
    pattern: "song",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {
      // Get the song name or URL from the message or quoted text
      const play = match || message.reply_message.text;
      
      // If no song name or URL is provided, prompt the user
      if (!play) {
        return await message.reply(`_Enter A Song Name_\n_📌 Example: *${m.prefix}song Heat Waves*_`);
      }

      // React with a music emoji to indicate processing
      await message.client.sendMessage(message.jid, { react: { text: "🎧", key: m.key } });

      // Make the API request to fetch the song
      const res = await axios.get(`https://viper.xasena.me/api/v1/yta?query=${encodeURIComponent(play)}`);
      const response = res.data;

      // Check if the response is successful
      if (response.status !== "true") {
        return message.reply("_❗ An error occurred while fetching the song details. Please try again with a different song name or link._");
      }

      const { title, downloadUrl } = response.data;

      // Inform the user that the download is starting
      await message.client.sendMessage(message.jid, { text: `_⬇ Downloading *${title}...*_` }, { quoted: m });

      // Send the audio file directly as a message
      let buttonMessage = {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      };

      // Send as audio and also as a downloadable document
      let doc = {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg', // Generic file mimetype for documents
        fileName: `${title}.mp3`,
      };

      // Send the audio and document to the user
      await message.client.sendMessage(message.jid, buttonMessage, { quoted: m });
      await message.client.sendMessage(message.jid, doc, { quoted: m });

    } catch (error) {
      await message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      message.reply(`_An Error Occurred_`);
    }
  }
);

pnix(
  {
    pattern: "img",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {

      const img = match || message.reply_message.text;

      if (!img) {
        return await message.reply(`_Enter A Text And Number Of Images You Want_\n_📌 _Example: *${m.prefix}img Pheonix MD;6*_`);
      }

      await message.client.sendMessage(message.jid, { react: { text: "⬇️", key: m.key } });
      
      let [query, amount] = img.split(";");
      const result = await fetchImages(query, amount);

      await message.reply(`_⬇️ Downloading *${amount || 5}* Images For *${query}*..._`);

      const shuffledImages = shuffleArray(result); // Shuffle the array of image URLs
      for (let imageUrl of shuffledImages) {
        await message.client.sendMessage(message.jid, { image: { url: imageUrl } });
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      // Send "❌" emoji as a reaction after encountering an error
      await message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      await message.reply("_Error fetching images. Please try again later_");
    }
  }
);

async function fetchImages(query, amount = 5) {
  const apiUrl = `${X.BASE_URL}api/search/gimage?text=${encodeURIComponent(query)}`;
  const response = await axios.get(apiUrl);
  if (response.status === 200 && response.data.code === 200) {
    return response.data.result.searchResults.slice(0, amount);
  } else {
    throw new Error("_API request failed or returned an error_");
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function gimage(query, amount = 5) {
                let list = [];
                return new Promise((resolve, reject) => {
                    gis(query, async (error, result) => {
                        for (
                            var i = 0;
                            i < (result.length < amount ? result.length: amount);
                            i++
                        ) {
                            list.push(result[i].url);
                            resolve(list);
                        }
                    });
                });
            };


pnix({
    pattern: '(insta|ig)',
    fromMe: isPrivate,
    desc: 'Download Instagram Post/Reel',
    type: 'downloader',
}, async (message, match, m) => {
    const url = match || message.reply_message.text;
    
    if (!url) {
        return await message.reply(`_Enter An Instagram Post/Reel Url\n_📌 Example: *${m.prefix}insta https://www.instagram.com/p/CcPUubloTnz/?utm_source=ig_web_copy_link*_`);
    }

    // Notify the user that the download process has started
    const downloadMessage = await message.reply('_⬇️ Downloading..._');

    try {
        const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${url}`);
        const { status, data } = response.data;

        if (status && data.length > 0) {
            const media = data[0];
            const mediaUrl = media.url;
            const caption = "_*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʜᴏᴇɴɪx-ᴍᴅ*_";

            if (media.type === 'image') {
                await message.client.sendMessage(message.jid, { image: { url: mediaUrl }, caption });
            } else if (media.type === 'video') {
                await message.client.sendMessage(message.jid, { video: { url: mediaUrl }, caption });
            } else {
                await message.reply('Media type not supported.');
            }
        } else {
            await message.reply('Failed to retrieve media from the provided URL.');
        }

        // Edit the initial message to indicate download completion
        await message.sendMessage('_Download Completed!_', { edit: downloadMessage.key }, "text");

    } catch (error) {
        console.error('Error fetching media:', error);

        // Edit the download message to indicate an error occurred
        await message.sendMessage(
            `_❌ An Error Occurred. Please Report This Error Using ${m.prefix}rbug Command_`, 
            { edit: downloadMessage.key }, 
            "text"
        );
    }
});

pnix({
    pattern: 'fb',
    fromMe: isPrivate,
    desc: 'Download Facebook Video or Image',
    type: 'downloader',
}, async (message, match, m) => {
    const url = match || message.reply_message.text;

    if (!url) {
        return await message.reply(`_Enter A Facebook Post Url_\n_📌 Example: *${m.prefix}fb https://www.facebook.com/FoodMakersBr/videos/tire-o-feijão-do-pote-de-sorvete-e-faça-essa-receita-ainda-hoje/454262112817834/*_`);
    }

    // Notify the user that the download process has started
    const downloadMessage = await message.reply('_⬇️ Downloading..._');

    try {
        const response = await axios.get(`${X.BASE_URL}api/download/fb?url=${url}`);
        const { status, result } = response.data;

        if (status && result.hd) {
            const mediaUrl = result.hd;

            // Check if the media URL contains "mp4" to determine if it's a video
            const isVideo = mediaUrl.includes('mp4');
            const caption = "_*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʜᴏᴇɴɪx-ᴍᴅ*_";

            if (isVideo) {
                // Send the video file
                await message.client.sendMessage(message.jid, { video: { url: mediaUrl }, caption });
            } else {
                // Send the image file
                await message.client.sendMessage(message.jid, { image: { url: mediaUrl }, caption });
            }

            // Edit the initial message to indicate download completion
            await message.sendMessage('_Download Completed!_', { edit: downloadMessage.key }, "text");
        } else {
            await message.reply('Failed to retrieve media from the provided URL.');
        }

    } catch (error) {
        console.error('Error fetching media:', error);

        // Edit the download message to indicate an error occurred
        await message.sendMessage(
            `_❌ An Error Occurred. Please Report This Error Using ${m.prefix}rbug Command_`, 
            { edit: downloadMessage.key }, 
            "text"
        );
    }
});
  
pnix({
    pattern: 'tiktok',
    fromMe: isPrivate,
    desc: 'Download TikTok Video',
    type: 'downloader',
}, async (message, match, m) => {
    const url = match || message.reply_message.text;

    if (!url) {
        return await message.reply(`_Enter A TikTok Video Url_\n_📌 Example: *${m.prefix}tiktok https://www.tiktok.com/@sedboy.am/video/7242762638311050539*_`);
    }

    const downloadMessage = await message.reply('_⬇️ Downloading..._');

    try {
        const response = await axios.get(`${X.BASE_URL}api/download/tiktok?url=${url}`);
        const { status, result } = response.data;

        if (status && result.nowm) {
            const mediaUrl = result.nowm;
            const caption = "_*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʜᴏᴇɴɪx-ᴍᴅ*_";
          
            await message.client.sendMessage(message.jid, { video: { url: mediaUrl }, caption });
            await message.sendMessage('_Download Completed!_', { edit: downloadMessage.key }, "text");
        } else {
            await message.reply('Failed to retrieve media from the provided URL.');
        }

    } catch (error) {
        console.error('Error fetching media:', error);

        await message.sendMessage(
            `_❌ An Error Occurred. Please Report This Error Using ${m.prefix}rbug Command_`, 
            { edit: downloadMessage.key }, 
            "text"
        );
    }
});

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
      const play = match || m.quoted?.text;
      
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
      // Catch and respond to any errors during the process
      message.reply(`_Can't Find The Song? Try Searching It With The Name Of The Artist_\n_📌 Example: *${m.prefix}song Heat Waves Glass Animals*_`);
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
      // Send "⬇️" emoji as a reaction initially
      await message.client.sendMessage(message.jid, { react: { text: "⬇️", key: m.key } });

const img = match || m.quoted.text

      if (!img) {
        return await message.reply(`_Enter A Text And Number Of Images You Want_\n_📌 _Example: *${m.prefix}img Pheonix MD;6*_`);
      }

      let [query, amount] = img.split(";");
      const result = await fetchImages(query, amount);

      // Send "✅" emoji as a reaction after successful fetching
      await message.client.sendMessage(message.jid, { react: { text: "✅", key: m.key } });
      await message.reply(`_⬇️Downloading... ${amount || 5} Images For ${query}_`);

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

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

// Play Command
pnix(
  {
    pattern: "play",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {
    await message.client.sendMessage(message.jid, { react: { text: "🎼", key: m.key } });

    const play = match || m.quoted.text;
    if (!play) return await message.reply(`_Enter A Song Name/Link_\n_📌 Example: *${m.prefix}play Heat Waves*_`);

      let yts = require("yt-search");
      let search = await yts(play);
      let anu = search.videos[0];
      let infoYt = await ytdl.getInfo(anu.url);

      if (infoYt.videoDetails.lengthSeconds >= videotime) return message.reply(`*Video File Is Too Big*`);

      const randomName = `${Math.floor(Math.random() * 10000)}.mp3`;

      await message.client.sendMessage(message.jid, { text: `_⬇ Downloading... *${infoYt.videoDetails.title}*_` }, { quoted: m });

      const stream = ytdl(anu.url, {
        filter: (info) => info.audioBitrate == 160 || info.audioBitrate == 128,
      }).pipe(fs.createWriteStream(`./media/${randomName}`));

      await new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.on("finish", resolve);
      });

      let stats = fs.statSync(`./media/${randomName}`);
      if (stats.size / (1024 * 1024) <= dlsize) {
        await message.client.sendMessage(message.jid, { text: `_⬆ Uploading... *${infoYt.videoDetails.title}*_` }, { quoted: m });

        let buttonMessage = {
          audio: fs.readFileSync(`./media/${randomName}`),
          mimetype: 'audio/mpeg',
          fileName: infoYt.videoDetails.title + ".mp3",
        };

        await message.client.sendMessage(message.jid, buttonMessage, { quoted: m });
        message.client.sendMessage(message.jid, { react: { text: "✅", key: m.key } });
      } else {
        message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
        message.reply(`_File size bigger than 100mb_`);
      }

      fs.unlinkSync(`./media/${randomName}`);
    } catch (error) {
      message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      message.reply(`_An error occurred during download._`);
    }
  }
);


pnix(
  {
    pattern: "song",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {
      await message.client.sendMessage(message.jid, { react: { text: "🎧", key: m.key } });
      const play = match || m.quoted.text;
      if (!play) return await message.reply(`_Enter A Song Name/Link_\n_📌 Example: *${m.prefix}play Heat Waves*_`);

      const res = await axios.get(`https://viper.xasena.me/api/v1/yta?query=${encodeURIComponent(play)} Song`);
      const response = res.data;

      if (response.status !== "true") {
        return message.reply("_An error occurred while fetching the song details._");
      }

      const { title, downloadUrl } = response.data;

      await message.client.sendMessage(message.jid, { text: `_⬇ Downloading *${title}...*_` }, { quoted: m });

      // Send the audio directly from the downloadUrl
      let buttonMessage = {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      };


      await message.client.sendMessage(message.jid, buttonMessage, { quoted: m });
      
    } catch (error) {
      message.reply(`_An error occurred during download._`);
    }
  }
);

// YouTube Search Command
pnix(
  {
    pattern: "yts",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {
    
   await message.client.sendMessage(message.jid, { react: { text: "🔎", key: m.key } });

    const searchTerm = match || m.quoted.text;
    if (!searchTerm) return await message.reply(`_Enter A Text To Search_\n_📌 Example: *${m.prefix}yts How To Make WhatsApp Bot*_`);
    
      let yts = require("yt-search");
      let search = await yts(searchTerm);

      if (!search.videos || search.videos.length === 0) {
        message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
        return await message.reply(`_No Results Found For *${searchTerm}*_`);
      }

      let resultsMessage = search.videos.slice(0, 5).map((video, index) => `
╭──────────❮ ${index + 1} ❯──────────
 *✒️ Title:* ${video.title}
 *🔗 Link:* ${video.url}
 *⏱ Duration:* ${video.timestamp}
╰───────────────────⦁
      `).join("\n");

      await message.client.sendMessage(message.jid, { text: resultsMessage }, { quoted: m });
      message.client.sendMessage(message.jid, { react: { text: "✅", key: m.key } });
    } catch (error) {
      message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      message.reply(`_An error occurred during search._`);
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

pnix(
  {
    pattern: "tgs",
    fromMe: isPrivate,
    type: "downloader",
  },
  async (message, match, m) => {
    try {
      
    await message.client.sendMessage(message.jid, { react: { text: "📦", key: m.key } });

    const tgs = match || m.quoted.text;

    // If no URL is provided, prompt the user with an example.
    if (!tgs) {
      await message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      return message.reply(
        "_Enter A Telegram Sticker URL_\n_📌 Example: *${m.prefix}tgs https://t.me/addstickers/Oldboyfinal*_"
      );
    }

    let packid = tgs.split("/addstickers/")[1];
    let { result } = await getJson(
      `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=${encodeURIComponent(
        packid
      )}`
    );

    // Check if the sticker set is animated and inform the user if it is not supported.
    if (result.is_animated) {
      await message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      return message.reply("_Animated Stickers Are Not Supported_");
    }

    // Inform the user about the total number of stickers and the estimated time.
    message.reply(
      `*Total Stickers:* ${result.stickers.length}\n*Estimated Completion Time:* ${
        result.stickers.length * 1.5
      } seconds`.trim()
    );

    // Process each sticker
    for (let sticker of result.stickers) {
      try {
        let file_path = await getJson(
          `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${sticker.file_id}`
        );

        // Send each sticker as a message.
        await message.client.sendMessage(
          `https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${file_path.result.file_path}`,
          {
            packname: Config.STICKER_DATA.split(";")[0],
            author: Config.STICKER_DATA.split(";")[1],
          },
          "sticker"
        );

        // React with a "✅" if the sticker was sent successfully.
        await message.client.sendMessage(message.jid, { react: { text: "✅", key: m.key } });
      } catch (error) {
        // If there is an error, react with a "❌" and continue to the next sticker.
        await message.client.sendMessage(message.jid, { react: { text: "❌", key: m.key } });
      }

      // Add a delay before processing the next sticker.
      await sleep(1500);
    }

    // Inform the user when all stickers have been sent.
    message.reply("_All Stickers Sent Successfully._");
  }
);

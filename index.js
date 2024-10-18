const {
	default: makeWASocket,
	Browsers,
	makeInMemoryStore,
	useMultiFileAuthState,
  fetchLatestBaileysVersion,
	getContentType,
} = require("@whiskeysockets/baileys");
var CryptoJS = require("crypto-js");
const fs = require("fs");
const { readdirSync, statSync, unlinkSync } = require('fs');
const axios = require("axios");
const {
	serialize
} = require("./lib/serialize");
const {
	Message,
	Image,
	Sticker
} = require("./lib/Base");
const pino = require("pino");
const path = require("path");
const { join } = require('path');
const chalk = require('chalk');
const events = require("./lib/event");
const got = require("got");
const config = require("./config");
const { tmpdir } = require('os');
const {
	PluginDB
} = require("./lib/database/plugins");
const { getBot } = require("./lib/index");
const Greetings = require("./lib/Greetings");
const {
	async
} = require("q");
const {
	decodeJid
} = require("./lib");
const store = makeInMemoryStore({
	logger: pino().child({
		level: "silent",
		stream: "store"
	}),
});
if(!store.diamond) store.diamond = {
	    count: 0,
	    limit: 3
	}
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
require("events").EventEmitter.defaultMaxListeners = 0;

const nodemailer = require('nodemailer');

// Function to send an email
async function pnix(sender, pass, receiver, subject, text) {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender, // Sender email address
            pass: pass // Sender email password
        }
    });

    // Define email options
    let mailOptions = {
        from: sender, // Sender email address
        to: receiver, // Recipient email address
        subject: subject, // Subject line
        text: text // Plain text body
    };

    try {
        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'Email sent successfully!';
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        throw new Error('Failed to send email!');
    }
}

fs.readdirSync(__dirname + "/lib/database/").forEach((plugin) => {
	if (path.extname(plugin).toLowerCase() == ".js") {
		try {
			require(__dirname + "/lib/database/" + plugin);
		} catch (e) {
			console.log(`Failed to reactivate plugin ${plugin}: ${e.message}`);
			fs.unlinkSync(__dirname + "/lib/database/" + plugin);
		}
	}
});

  async function Phoenix() {
    const isSessionFormatCorrect = getBot(config.SESSION_ID);

    if (!isSessionFormatCorrect) {
        return;
    }

    // Split the SESSION_ID to get the id
    const [name, sessionId] = config.SESSION_ID.split("~");
    
    // Ensure the name is "Phoenix"
    if (name !== "Phoenix") {
        console.log("❌ Modified Version Detected. Use Phoenix-MD Original Version From github.com/AbhishekSuresh2/Phoenix-MD");
        console.log("Dear User This Is A Copy Version Of Phoenix-MD. Use Phoenix-MD Original Version From https://github.com/AbhishekSuresh2/Phoenix-Bot");
        console.log("ℹ️😂 Hey Kid Go And Make Your Own Bot Instead Of Renaming Others Bot😂😂😂😂😂😂😂😂");
        console.log("😂😂This Is A Copied Version!");
        console.log("ℹ️ My Real Creator Is Abhishek Suresh!");
        process.exitCode = 1; // Set exit code to indicate failure
        return;
    }

    // Fetch the data from the endpoint using the session ID
    try {
    // Fetch the data from the endpoint using the session ID
    const { data } = await axios.get(`https://abhi-simple-paste.onrender.com/paste/view/${sessionId}`);

    // Assuming `data` itself contains the correct structure for `creds.json`, you can write it directly:
    await fs.writeFileSync("./lib/phoenix/session/creds.json", JSON.stringify(data));
} catch (error) {
    console.error("Error fetching data from endpoint:", error);
    return; // Stop execution if fetching fails
}

    const { state, saveCreds } = await useMultiFileAuthState(
        "./lib/phoenix/session/",
        pino({ level: "silent" })
    );

	        console.log("Syncing Database");
	await config.DATABASE.sync();

	let conn = makeWASocket({
		logger: pino({
			level: "silent"
		}),	

		auth: state,
		printQRInTerminal: true,
		generateHighQualityLinkPreview: true,
		browser: Browsers.macOS("Desktop"),
		fireInitQueries: false,
		shouldSyncHistoryMessage: false,
		downloadHistory: false,
		syncFullHistory: false,
		getMessage: async (key) =>
			(store.loadMessage(key.id) || {}).message || {
				conversation: null,
			},
	});

	store.bind(conn.ev);
	setInterval(() => {
		store.writeToFile("./lib/Db/store.json");
	}, 30 * 1000);

	conn.ev.on("creds.update", saveCreds);
	conn.ev.on("contacts.update", (update) => {
		for (let contact of update) {
			let id = decodeJid(contact.id);
			if (store && store.contacts)
				store.contacts[id] = {
					id,
					name: contact.notify
				};
		}
	});
	conn.ev.on("connection.update", async (s) => {
		const {
			connection,
			lastDisconnect
		} = s;
		if (connection === "connecting") {
			console.log("Phoenix-MD");
			console.log("ℹ️ Connecting To Your WhatsApp");
		}
		if (connection === "open") {
			console.log("Connected Successfully ✅");
			console.log("⬇️ Installing Plugins");
			let plugins = await PluginDB.findAll();
			plugins.map(async (plugin) => {
				if (!fs.existsSync("./plugins/" + plugin.dataValues.name + ".js")) {
					console.log(plugin.dataValues.name);
					var response = await got(plugin.dataValues.url);
					if (response.statusCode == 200) {
						fs.writeFileSync(
							"./plugins/" + plugin.dataValues.name +
							".js",
							response.body
						);
						require(__dirname + "/plugins/" + plugin.dataValues
							.name + ".js");
					}
				}
			});
			console.log("Plugins Installed ✅");
			fs.readdirSync(__dirname + "/plugins").forEach((plugin) => {
	if (path.extname(plugin).toLowerCase() == ".js") {
		try {
			require(__dirname + "/plugins/" + plugin);
		} catch (e) {
			console.log(`ℹ This Plugin Has An Error: ${plugin}`);
			console.log(`Error: ${e.message}`);
			fs.unlinkSync(__dirname + "/plugins/" + plugin);
		}
	}
});
			console.log("Phoenix-MD By Abhishek Suresh 🍀");

			const numericPart = conn.user.id.split(':')[0];

if (config.SUDO.indexOf(numericPart) === -1) {
    config.SUDO = config.SUDO + "," + numericPart;
}
const own = config.OWNER_NUMBER; // Assuming config.OWNER_NUMBER contains the owner's number

// Check if owner's number is not already in config.SUDO
if (config.SUDO.indexOf(own) === -1) {
    config.SUDO += (config.SUDO ? "," : "") + own; // Add owner's number to config.SUDO
}

			
			conn.sendMessage(conn.user.id, {
  text: `*ᴘʜᴏᴇɴɪx-ᴍᴅ ꜱᴛᴀʀᴛᴇᴅ*\n\n*ᴠᴇʀꜱɪᴏɴ:* ${require(__dirname + "/package.json").version}\n*ᴘʟᴜɢɪɴꜱ:* ${events.commands.length}\n*ᴍᴏᴅᴇ:* ${config.WORK_TYPE}\n*ᴘʀᴇꜰɪx:* ${config.HANDLERS}\n*ꜱᴜᴅᴏ:* ${config.SUDO}`,
  contextInfo: {
    externalAdReply: {
      title: "ᴘʜᴏᴇɴɪx-ᴍᴅ",
      body: "ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ",
      thumbnailUrl: "https://i.ibb.co/tHWJrz3/IMG-20231128-WA0005.jpg",
      mediaType: 1,
      mediaUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
      sourceUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
    }
  }
});


try {
    conn.ev.on("group-participants.update", async (data) => {
Greetings(data, conn);
    });
    conn.ev.on("messages.upsert", async (m) => {
        if (m.type !== "notify") return;
        const ms = m.messages[0];
        let msg = await serialize(JSON.parse(JSON.stringify(ms)), conn, store);
        if (!msg.message) return;
        if (msg.body[1] && msg.body[1] == " ")
            msg.body = msg.body[0] + msg.body.slice(2);
        let text_msg = msg.body;
        msg.store = store;
        if (text_msg && config.LOGS)
            console.log("🍀 Phoenix-MD Bot Logs");
            console.log(`At : ${msg.from.endsWith("@g.us") ? (await conn.groupMetadata(msg.from)).subject : msg.from}\nFrom : ${msg.sender}\nMessage:${text_msg}`);
             
async function handlephoenixBot(error) {
	const jid = '919074692450@s.whatsapp.net';
	
                try {
                    const errorMessage = `*ᴘʜᴏᴇɴɪx-ᴍᴅ ʙᴏᴛ ᴇʀʀᴏʀ ʀᴇᴘᴏʀᴛ*\n\n*👤 ꜱᴇɴᴅᴇʀ:* ${msg.sender}\n*💻 ᴄᴏᴍᴍᴀɴᴅ:* ${msg.body}\n*🏷️ ᴠᴇʀꜱɪᴏɴ:* ${require(__dirname + "/package.json").version}\n*❗ᴇʀʀᴏʀ:* \`\`\`${error.message}\`\`\``;
                    conn.sendMessage(jid, {
  text: `${errorMessage}`,
  contextInfo: {
    externalAdReply: {
      title: "ᴘʜᴏᴇɴɪx-ᴍᴅ",
      body: "ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ",
      thumbnailUrl: "https://i.ibb.co/tHWJrz3/IMG-20231128-WA0005.jpg",
      mediaType: 1,
      mediaUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
      sourceUrl: "https://github.com/AbhishekSuresh2/Phoenix-MD",
    }
  }
});

                } catch (error) {
                    console.error('Error occurred while sending error message:', error);
                }
            }
            
if (config.AUTO_STATUS_READ && msg.key.remoteJid === 'status@broadcast') {
    setTimeout(async () => {
        try {
            await conn.readMessages([msg.key]);
            let typ = getContentType(msg.message);
            console.log((/protocolMessage/i.test(typ)) ? `${msg.key.participant.split('@')[0]} Deleted Status❗` : `ℹ️ Phoenix-MD Viewed Status Of: ${msg.key.participant.split('@')[0]}`);
        } catch (error) {
            console.error('Error reading status message:', error);
        }
    }, 500);
}

        events.commands.map(async (command) => {
            if (command.fromMe && !config.SUDO.split(",").includes(msg.sender.split("@")[0] || !msg.isSelf))
                return;
            let comman;
            if (text_msg) {
                comman = text_msg ? text_msg[0] + text_msg.slice(1).trim().split(" ")[0].toLowerCase() : "";
                msg.prefix = new RegExp(config.HANDLERS).test(text_msg) ? text_msg.split("").shift() : ",";
            }
            if (command.pattern && command.pattern.test(comman)) {
                var match;
                try {
                    match = text_msg.replace(new RegExp(comman, "i"), "").trim();
                } catch {
                    match = false;
                }
                whats = new Message(conn, msg, ms);
                if (command.diamond) {
                    if (store.diamond.count >= store.diamond.limit) return await whats.client.sendMessage(whats.jid, { text: '_You Dont Have Enough Diamond 💎_\n\n_*You Can Earn Diamonds From Games And Economy Menu*_' });
                    store.diamond.count = store.diamond.count + 1;
                    command.function(whats, match, msg, conn, store)
                        .catch(handlephoenixBot);
                } else {
                    command.function(whats, match, msg, conn, store)
                        .catch(handlephoenixBot);
                }
            } else if (text_msg && command.on === "text") {
                whats = new Message(conn, msg, ms);
                command.function(whats, text_msg, msg, conn, m)
                    .catch(handlephoenixBot);
            } else if ((command.on === "image" || command.on === "photo") && msg.type === "imageMessage") {
                whats = new Image(conn, msg, ms);
                command.function(whats, text_msg, msg, conn, m, ms)
                    .catch(handlephoenixBot);
            } else if (command.on === "sticker" && msg.type === "stickerMessage") {
                whats = new Sticker(conn, msg, ms);
                command.function(whats, msg, conn, m, ms)
                    .catch(handlephoenixBot);
            }
        });
    });
} catch (e) {
    console.log(e + "\n\n\n\n\n" + JSON.stringify(msg));
}

		}
		if (connection === "close") {
			console.log(s);
			console.log(
				"⚠️ Connection Closed! Session Id Is Not Valid Please Scan QR And In Put New Session Id."
			);
			Phoenix().catch((err) => console.log(err));
		} else {
			/*

			 */
		}
	});
	process.on("uncaughtException", async (err) => {
		let error = err.message;
		await conn.sendMessage(conn.user.id, {
			text: error
		});
		console.log(err);
	});
}

setTimeout(() => {
	Phoenix().catch((err) => console.log(err));
}, 3000);

app.get("/", (req, res) => {
	res.send("Hello Phoenix-MD Started");
});
app.listen(port, () => console.log(`Phoenix-MD Server Listening On Port http://localhost:${port}`));

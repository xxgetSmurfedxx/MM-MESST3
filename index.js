require('dotenv').config();
const request = require('request');
const Discord = require('discord.js');
const fs = require('fs')
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

client.login(process.env.BOT_TOKEN);

let upd = null
let guildId = "Moonstruck Market"
//"942970588903927828"
let channelName = "bot-commands"


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
	if (msg.content === "!testing"){
		msg.reply("Reading...")
		fs.readFile('cache.json',(err,data) => {
			if (err) {
				msg.reply(err)
			}
			deets = JSON.parse(data)
			msg.reply(deets)
		})
	}
});

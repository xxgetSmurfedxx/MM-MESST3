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

function startBot(track,sym,isGuild,isChan){
	let url = 'https://api-mainnet.magiceden.dev/v2/collections/' + sym;

	request(url, {json: true},(err,res,body) => {
		if (err){
			console.log("Error retrieving collection.")
		}
		else if (body === "collection not found"){
			console.log("Collection not found.")
		}
		else {
			let cName = body["name"];
			client.guilds.cache.get(isGuild.id).members.edit(client.user.id,{nick: cName});
			sleep(500);
			let cImg = body["image"];
			client.user.setAvatar(cImg)
			.then(user=> console.log("Changing avatar..."))
			.catch(console.log("Unable to change avatar."));
			if (upd !== null){
				clearInterval(upd);
				upd = null;
			}
			if (upd === null){
				request(url+"/stats", {json: true},(err2,res2,body2) => {
					if (err2) {
						client.channels.cache.get(isChan.id).send("Error retrieving collection.");
					}
					else if(body2 === "collection not found"){
						client.channels.cache.get(isChan.id).send("Collection not found.");
					}
					else {
						let floor = (body2["floorPrice"]/1000000000).toFixed(2) + " SOL";
						let volume = (body2["volumeAll"]/1000000000).toFixed(2) + " SOL";
						let listed = body2["listedCount"];
						if (track === "floor"){
							client.channels.cache.get(isChan.id).send("MESST3 tracking floor price of " + cName)
							client.user.setActivity("FP: " + floor);
						}
						else if (track === "volume"){
							client.channels.cache.get(isChan.id).send("MESST3 tracking volume of " + cName)
							client.user.setActivity("VOL: " + volume);
						}
						else if (track === "listed"){
							client.channels.cache.get(isChan.id).send("MESST3 tracking listed count of " + cName)
							client.user.setActivity("LST: " + listed);
						}
					};
				});
				upd = setInterval(() => {
					request(url+"/stats", {json: true},(err2,res2,body2) => {
						if (err2) {
							client.channels.cache.get(isChan.id).send("Error retrieving collection.");
						}
						else if(body2 === "collection not found"){
							client.channels.cache.get(isChan.id).send("Collection not found.");
						}
						else {
							let floor = (body2["floorPrice"]/1000000000).toFixed(2) + " SOL";
							let volume = (body2["volumeAll"]/1000000000).toFixed(2) + " SOL";
							let listed = body2["listedCount"];
							if (track === "floor"){
								client.user.setActivity("FP: " + floor);
							}
							else if (track === "volume"){
								client.user.setActivity("VOL: " + volume);
							}
							else if (track === "listed"){
								client.user.setActivity("LST: " + listed);
							}
						};
					});
				}, 5000);
			};
		}
	})
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	let isGuild = client.guilds.cache.find(guild => guild.name === guildId)
	let isChan = client.channels.cache.find(cChan => cChan.name === channelName)
	fs.readFile('cache.json',(err,data) => {
		if (err) throw err
		deets = JSON.parse(data)
		track = deets["stat"]
		sym = deets["symbol"]
		
		if (!track || track === ''){
			client.channels.cache.get(isChan.id).send("Nothing to track.")
		}
		else{
			startBot(track,sym,isGuild,isChan)
		}
	})
});

client.on('messageCreate', msg => {
	if (msg.content.startsWith("!track3.")) {
		if(msg.member.permissionsIn(msg.channel).has("ADMINISTRATOR")){
			data = msg.content.split(".")
			let add = {
				stat: data[1],
				symbol: data[2]
			}
			
			let string = JSON.stringify(add,null,2)
			
			fs.writeFile('cache.json',string, (err) => {
				if (err) throw err
				client.channels.cache.get(isChan.id).send('Tracking ' + data[1] + ' of ' + data[2])
			})
		}
	}
});
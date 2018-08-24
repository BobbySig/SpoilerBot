/* --- Discord Bot Code --- */

// Initialization
var Discord = require("discord.js");
var client = new Discord.Client();

const caesarSalad = require('caesar-salad');
const ROT13 = caesarSalad.ROT13;

var Config = require("./config.js");
var config = new Config();

function sendHelpMessage(message) {
  var embed = new Discord.RichEmbed()
    .setTitle("SpoilerBot Help")
    .setURL("https://discord-spoilerbot.glitch.me")
    .setColor(config.COLOR)
    .setDescription(config.HELP_MSG);
  message.author.send({embed});
  message.delete();
}

function sendSpoilerMessage(message) {
  var embed;
  var spoilerMsg = message.content.substring(config.CMD_SPOILER.length + 1);
  var splitIndex = spoilerMsg.includes(config.DELINIATOR);
  if (spoilerMsg === "" || splitIndex === false) {
    sendHelpMessage(message);
  } else {
    var spoilerFields = spoilerMsg.split(config.DELINIATOR);
    if (spoilerFields[1] === "") {
      sendHelpMessage(message);
    } else {
      var ciphertext = ROT13.Cipher().crypt(spoilerFields[1]);
      var encodedCiphertext = encodeURIComponent(ciphertext);
      if (spoilerFields[0].length > 256) {
        embed = new Discord.RichEmbed()
          .setTitle("Your Spoiler's Title is Too Long!")
          .setColor(config.COLOR)
          .setDescription(config.OVERLENGTH_TITLE + config.OVERLENGTH_FOOTER);
        message.author.send({embed}).then(() => {
          message.author.send(message.content);
        });
        message.delete();
      } else if (encodedCiphertext.length > 2000) {
        embed = new Discord.RichEmbed()
          .setTitle("Your Spoiler Text is Too Long!")
          .setColor(config.COLOR)
          .setDescription(config.OVERLENGTH_SPOILER + config.OVERLENGTH_FOOTER);
        message.author.send({embed}).then(() => {
          message.author.send(message.content);
        });
        message.delete();
      } else {
        embed = new Discord.RichEmbed()
          .setAuthor(message.author.username, message.author.displayAvatarURL)
          .setTitle(spoilerFields[0])
          .setURL(config.DECODE_URL_BASE + encodedCiphertext)
          .setColor(config.COLOR)
          .setDescription(ciphertext.trim());
        message.channel.send({embed});
        message.delete();
      }
    }
  }
}

client.on("ready", () => {
  console.log("SpoilerBot online.");
});

client.on("message", (message) => {
  if (message.author.bot || !(message.channel instanceof Discord.TextChannel) || !message.content.startsWith(config.PREFIX)) {
    return;
  } else if (message.content.startsWith(config.CMD_SPOILER)) {
    sendSpoilerMessage(message);
  }
});

// Start the Discord bot login process.
client.login(process.env.DISCORD_SECRET);

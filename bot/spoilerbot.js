/* --- Discord Bot Code --- */

// Initialization
var Discord = require("discord.js");
var client = new Discord.Client();

const caesarSalad = require('caesar-salad');
const ROT13 = caesarSalad.ROT13;

var Strings = require("./strings.js");
var botStrings = new Strings();
const baseLength = " `".length + "` \n".length + botStrings.FOOTER.length;

function sendHelpMessage(message) {
  var embed = new Discord.RichEmbed()
    .setTitle("SpoilerBot Help")
    .setURL("https://discord-spoilerbot.glitch.me")
    .setColor(botStrings.COLOR)
    .setDescription(botStrings.HELP_MSG);
  message.author.send({embed});
  message.delete();
}

function sendSpoilerMessage(message) {
  var embed;
  var spoilerMsg = message.content.substring(botStrings.CMD_SPOILER.length + 1);
  var splitIndex = spoilerMsg.includes(botStrings.DELINIATOR);
  if (spoilerMsg === "" || splitIndex === false) {
    sendHelpMessage(message);
  } else {
    var spoilerFields = spoilerMsg.split(botStrings.DELINIATOR);
    if (spoilerFields[1] === "") {
      sendHelpMessage(message);
    } else {
      var ciphertext = ROT13.Cipher().crypt(spoilerFields[1]);
      var encodedCiphertext = encodeURIComponent(ciphertext);
      if (spoilerFields[0].length > 256) {
        embed = new Discord.RichEmbed()
          .setTitle("Your Spoiler's Title is Too Long!")
          .setColor(botStrings.COLOR)
          .setDescription(botStrings.OVERLENGTH_TITLE + botStrings.OVERLENGTH_FOOTER);
        message.author.send({embed}).then(() => {
          message.author.send(message.content);
        });
        message.delete();
      } else if (encodedCiphertext.length > 2000) {
        embed = new Discord.RichEmbed()
          .setTitle("Your Spoiler Text is Too Long!")
          .setColor(botStrings.COLOR)
          .setDescription(botStrings.OVERLENGTH_SPOILER + botStrings.OVERLENGTH_FOOTER);
        message.author.send({embed}).then(() => {
          message.author.send(message.content);
        });
        message.delete();
      } else {
        embed = new Discord.RichEmbed()
          .setAuthor(message.author.username, message.author.displayAvatarURL)
          .setTitle(spoilerFields[0])
          .setURL(botStrings.DECODE_URL_BASE + encodedCiphertext)
          .setColor(botStrings.COLOR)
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
  if (message.author.bot || !(message.channel instanceof Discord.TextChannel) || !message.content.startsWith(botStrings.PREFIX)) {
    return;
  } else if (message.content.startsWith(botStrings.CMD_SPOILER)) {
    sendSpoilerMessage(message);
  }
});

// Start the Discord bot login process.
client.login(process.env.DISCORD_SECRET);

const Discord = require("discord.js");
const ROT13 = require('caesar-salad').ROT13;
const Config = require("./config.js");

class SpoilerBot {
  constructor(client) {
    // Initialize class variables that are always used.
    this.config = new Config();
    // Configure and start the Discord client.
    this.client = client;
    this.client.on("ready", function() {
      console.log("SpoilerBot online.");
    });
    this.client.on("message", function(message) {
      handleMsg(message);
    });
  }

  /* --- Message Handlers --- */
  handleMsg(msg) {
    if (shouldRespond(msg) && message.content.startsWith(config.CMD_SPOILER)) {
      processSpoiler(message);
    }
  }

  processSpoiler(msg) {
    // Determine if we should send just the help message.
    var spoilerMsg = msg.content.substring(this.config.CMD_SPOILER.length + 1);
    var spoilerBreakdown = spoilerMsg.split(config.DELINIATOR);
    if (spoilerMsg === "" || spoilerBreakdown.length == 1 || spoilerBreakdown[1].trim === "") {
      sendHelpMsg(msg);
      return;
    }

    // Determine if the title is too long.
    var spTitle = spoilerBreakdown[0];
    if (spTitle.length > 256) {
      sendTitleTooLongMsg(msg);
      return;
    }

    // Determine if the spoiler's final URL is too long.
    var spSpoiler = spoilerBreakdown[1];
    var spEncoded = ROT13.Cipher().crypt(spSpoiler);
    var spURL = this.config.DECODE_URL_BASE + encodeURIComponent(spURL);
    if (spURL.length > 2000) {
      sendSpoilerTooLongMsg(msg);
      return;
    }

    // Our message is a valid spoiler, send it.
    sendSpoilerMessage(msg, spTitle, spEncoded, spURL, msg.author.username, message.author.displayAvatarURL);
  }

  /* --- Message Handling Helpers --- */
  shouldRespond(message) {
    if (message.author.bot || !(message.channel instanceof Discord.TextChannel) || !message.content.startsWith("!"))
      return false;
    return true;
  }

  sendTitleTooLongMsg(msg) {
    var errMsg = errorMsg("Your spoiler's title is too long!",
      this.config.OVERLENGTH_TITLE,
      this.config.OVERLENGTH_FOOTER);
    sendMsg(errMsg, msg.author).then(() => {
      sendMsg(msg.content, msg.author);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler title too long message. Log:");
      console.error(e);
    });
    deleteMsg(msg).catch((e) => {
      console.error("Error: Unable to delete original message. Log:");
      console.error(e);
    });
  }

  sendSpoilerTooLongMsg(msg) {
    var errMsg = errorMsg("Your spoiler is too long!",
      this.config.OVERLENGTH_SPOILER,
      this.config.OVERLENGTH_FOOTER);
    sendMsg(errMsg, msg.author).then(() => {
      sendMsg(msg.content, msg.author);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler text too long message. Log:");
      console.error(e);
    });
    deleteMsg(msg).catch((e) => {
      console.error("Error: Unable to delete original message. Log:");
      console.error(e);
    });
  }

  sendSpoilerMessage(msg, title, encodedSpoiler, encodedSpoilerUrl, username, avatarURL) {
    var embed = new Discord.RichEmbed()
      .setAuthor(username, avatarURL)
      .setTitle(title)
      .setURL(encodedSpoilerUrl)
      .setColor(this.config.COLOR)
      .setDescription(encodedSpoiler.trim());
    sendMsg({embed}, msg.channel).catch((e) => {
      console.error("Error: Unable to send spoiler message. Log:");
      console.error(e);
    });
    deleteMsg(msg).catch((e) => {
      console.error("Error: Unable to delete original message. Log:");
      console.error(e);
    });
  }

  sendHelpMsg(msg) {
    sendMsg(helpMsg(), msg.author).catch((e) => {
      console.error("Unable to send help message. Log:");
      console.error(e);
    });
    deleteMsg(msg).catch((e) => {
      console.error("Error: Unable to delete original message. Log:");
      console.error(e);
    });
  }

  /* --- Message Generators --- */
  helpMsg() {
    var embed = new Discord.RichEmbed()
      .setTitle("SpoilerBot Help")
      .setURL("https://discord-spoilerbot.glitch.me")
      .setColor(config.COLOR)
      .setDescription(config.HELP_MSG);
    return {embed};
  }

  errorMsg(errorTitle, errorMessage, errorFooter) {
    var embed = new Discord.RichEmbed()
      .setTitle(errorTitle)
      .setColor(this.config.COLOR)
      .setDescription(errorMessage)
      .setFooter(errorFooter);
    return {embed};
  }

  /* --- Network Task Helpers --- */
  async sendMsg(msg, channel) {
    return channel.send(msg);
  }

  async deleteMsg(msg) {
    return msg.delete();
  }

  start() {
    this.client.login(process.env.DISCORD_SECRET);
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.error("Unhandled Promise Rejection at: Promise ", p, "reason:", reason);
});

module.exports = SpoilerBot;

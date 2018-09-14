const Discord = require("discord.js");
const ROT13 = require('caesar-salad').ROT13;
const Config = require("./config.js");

class SpoilerBot {
  constructor(client, disableDefaultMsgBindings = false) {
    // Initialize class variables that are always used.
    this.config = new Config();
    // Configure the Discord client.
    this.client = client;
    var bot = this;
    if (!disableDefaultMsgBindings) {
      this.client.on("message", function(message) {
        bot.handleMsg(message);
      });
    }
  }

  /* --- Message Handlers --- */
  handleMsg(msg) {
    if (this.shouldRespond(msg) && msg.content.startsWith(this.config.CMD_SPOILER)) {
      this.processSpoiler(msg);
    }
  }

  processSpoiler(msg) {
    // Determine if we should send just the help message.
    var spoilerMsg = msg.content.substring(this.config.CMD_SPOILER.length + 1);
    var spoilerBreakdown = spoilerMsg.split(this.config.DELINIATOR);
    if (spoilerMsg === "" || spoilerBreakdown.length == 1 || spoilerBreakdown[1].trim() === "") {
      this.sendHelpMsg(msg);
      return;
    }

    // Determine if the title is too long.
    var spTitle = spoilerBreakdown[0].trim();
    if (spTitle.length > 256) {
      this.sendTitleTooLongMsg(msg);
      return;
    }

    // Determine if the spoiler's final URL is too long.
    var spSpoiler = spoilerBreakdown[1].trim();
    var spEncoded = ROT13.Cipher().crypt(spSpoiler);
    var spURL = this.config.DECODE_URL_BASE + encodeURIComponent(spEncoded);
    if (spURL.length > 2000) {
      this.sendSpoilerTooLongMsg(msg);
      return;
    }

    // Our message is a valid spoiler, send it.
    this.sendSpoilerMessage(msg, spTitle, spEncoded, spURL, msg.author.username, msg.author.displayAvatarURL);
  }

  /* --- Message Handling Helpers --- */
  shouldRespond(message) {
    if (message.author.bot || !(message.channel instanceof Discord.TextChannel) || !message.content.startsWith("!"))
      return false;
    return true;
  }

  sendTitleTooLongMsg(msg) {
    var bot = this;
    var errMsg = this.errorMsg(this.config.OVERLENGTH_TITLE_HEAD,
      this.config.OVERLENGTH_TITLE,
      this.config.OVERLENGTH_FOOTER);
    return this.sendMsg(errMsg, msg.author).then(() => {
      return bot.sendMsg(msg.content, msg.author);
    }).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler title too long message. Log:");
      console.error(e);
    });
  }

  sendSpoilerTooLongMsg(msg) {
    var bot = this;
    var errMsg = this.errorMsg(this.config.OVERLENGTH_SPOILER_HEAD,
      this.config.OVERLENGTH_SPOILER,
      this.config.OVERLENGTH_FOOTER);
    return this.sendMsg(errMsg, msg.author).then(() => {
      return bot.sendMsg(msg.content, msg.author);
    }).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler text too long message. Log:");
      console.error(e);
    });
  }

  sendSpoilerMessage(msg, title, encodedSpoiler, encodedSpoilerUrl, username, avatarURL) {
    var bot = this;
    var embed = new Discord.RichEmbed()
      .setAuthor(username, avatarURL)
      .setTitle(title)
      .setURL(encodedSpoilerUrl)
      .setColor(this.config.COLOR)
      .setDescription(encodedSpoiler.trim());
    return this.sendMsg({embed}, msg.channel).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler message. Log:");
      console.error(e);
    });
  }

  sendHelpMsg(msg) {
    var bot = this;
    return this.sendMsg(this.helpMsg(), msg.author).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Unable to send help message. Log:");
      console.error(e);
    });
  }

  /* --- Message Generators --- */
  helpMsg() {
    var embed = new Discord.RichEmbed()
      .setTitle(this.config.HELP_TITLE)
      .setURL(this.config.HOMEPAGE)
      .setColor(this.config.COLOR)
      .setDescription(this.config.HELP_MSG);
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
  sendMsg(msg, channel) {
    return channel.send(msg);
  }

  deleteMsg(msg) {
    return msg.delete();
  }
}

module.exports = SpoilerBot;

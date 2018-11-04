'use strict';

const Discord = require("discord.js");
const ROT13 = require('caesar-salad').ROT13;
const Strings = require("../strings/Strings.en-US.default");

/**
 * Represents an instance of SpoilerBot.
 * @constructor
 * @param {Discord.Client} client - The Discord client to listen for messages on.
 * @param {boolean} disableDefaultMsgBindings - true if you want to bind the client's
 * on message event yourself. Default: false.
 */
class SpoilerBot {
  constructor(client, disableDefaultMsgBindings = false) {
    // Initialize class variables that are always used.
    this.strings = new Strings();
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

  /**
   * Determines if a message starts with the bot's command and if it does, passes
   * it on for handling.
   * @param {Discord.Message} msg - The message to process.
   */
  handleMsg(msg) {
    if (this.shouldRespond(msg) && msg.content.startsWith(this.strings.CMD_SPOILER)) {
      this.processSpoiler(msg);
    }
  }

  /**
   * Processes a message that's been confirmed to start with the bot's command.
   * @param {Discord.Message} msg - The message to process that starts with the
   * bot's command.
   */
  processSpoiler(msg) {
    // Determine if we should send just the help message.
    var spoilerMsg = msg.content.substring(this.strings.CMD_SPOILER.length + 1);
    var spoilerBreakdown = spoilerMsg.split(this.strings.DELINIATOR);
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
    var spURL = this.strings.DECODE_URL_BASE + encodeURIComponent(spEncoded);
    if (spURL.length > 2000) {
      this.sendSpoilerTooLongMsg(msg);
      return;
    }

    // Our message is a valid spoiler, send it.
    this.sendSpoilerMessage(msg, spTitle, spEncoded, spURL, msg.author.username, msg.author.displayAvatarURL);
  }

  /* --- Message Handling Helpers --- */

  /**
   * Checks if the given message is possibly a command. If the message is from a
   * bot, is not from a text channel in a server, or does not start with the
   * command prefix, returns false. Otherwise returns true.
   * @param {Discord.Message} message - The message to process.
   * @returns {boolean} True if the message should be processed further, false if not.
   */
  shouldRespond(message) {
    if (message.author.bot || !(message.channel instanceof Discord.TextChannel) || !message.content.startsWith(this.strings.PREFIX))
      return false;
    return true;
  }

  /**
   * Sends a sequence of messages to a user notifying them that the title section
   * of their spoiler is too long, then deletes the original message.
   * @param {Discord.Message} msg - The message whose title is too long.
   */
  sendTitleTooLongMsg(msg) {
    var bot = this;
    var errMsg = this.errorMsg(this.strings.OVERLENGTH_TITLE_HEAD,
      this.strings.OVERLENGTH_TITLE,
      this.strings.OVERLENGTH_FOOTER);
    return this.sendMsg(errMsg, msg.author).then(() => {
      return bot.sendMsg(msg.content, msg.author);
    }).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler title too long message. Log:");
      console.error(e);
    });
  }

  /**
   * Sends a sequence of messages to a user notifying them that the spoiler section
   * of their spoiler is too long, then deletes the original message.
   * @param {Discord.Message} msg - The message whose spoiler is too long.
   */
  sendSpoilerTooLongMsg(msg) {
    var bot = this;
    var errMsg = this.errorMsg(this.strings.OVERLENGTH_SPOILER_HEAD,
      this.strings.OVERLENGTH_SPOILER,
      this.strings.OVERLENGTH_FOOTER);
    return this.sendMsg(errMsg, msg.author).then(() => {
      return bot.sendMsg(msg.content, msg.author);
    }).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler text too long message. Log:");
      console.error(e);
    });
  }

  /**
   * Sends a message containing a ROT13 encoded spoiler and a link to decode it,
   * then deletes the original message.
   * @param {Discord.Message} msg - The original spoiler message.
   * @param {String} title - The title secion of the spoiler.
   * @param {String} encodedSpoiler - The ROT13 encoded spoiler text.
   * @param {String} encodedSpoilerUrl - The URL to follow to decode the spoiler.
   * @param {String} username - The username of the user that sent the spoiler message.
   * @param {String} avatarURL - The URL of the user's avatar.
   */
  sendSpoilerMessage(msg, title, encodedSpoiler, encodedSpoilerUrl, username, avatarURL) {
    var bot = this;
    var embed = new Discord.RichEmbed()
      .setAuthor(username, avatarURL)
      .setTitle(title)
      .setURL(encodedSpoilerUrl)
      .setColor(this.strings.SPOILER_COLOR)
      .setDescription(encodedSpoiler.trim());
    return this.sendMsg({embed}, msg.channel).then(() => {
      return bot.deleteMsg(msg);
    }).catch((e) => {
      console.error("Error: Unable to send spoiler message. Log:");
      console.error(e);
    });
  }

  /**
   * Sends a help message to the user, then deletes the original message.
   * @param {Discord.Message} msg - The original message.
   */
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

  /**
   * Generates the standard help message.
   * @returns The help message.
   */
  helpMsg() {
    var embed = new Discord.RichEmbed()
      .setTitle(this.strings.HELP_TITLE)
      .setURL(this.strings.HOMEPAGE)
      .setColor(this.strings.HELP_COLOR)
      .setDescription(this.strings.HELP_MSG);
    return {embed};
  }

  /**
   * Generates the standard error message.
   * @param errorTitle - The text to go in the title of the error message.
   * @param errorMessage - The text to go in the body of the error message.
   * @param errorFooter - The text to go in the footer of the error message.
   * @returns The error message.
   */
  errorMsg(errorTitle, errorMessage, errorFooter) {
    var embed = new Discord.RichEmbed()
      .setTitle(errorTitle)
      .setColor(this.strings.ERROR_COLOR)
      .setDescription(errorMessage)
      .setFooter(errorFooter);
    return {embed};
  }

  /* --- Network Task Helpers --- */

  /**
   * Sends a message to a specific channel.
   * @param msg - The message to send.
   * @param channel - The channel to send the message to.
   */
  sendMsg(msg, channel) {
    return channel.send(msg);
  }

  /**
   * Deletes a message.
   * @param {Discord.Message} msg - The message to delete.
   */
  deleteMsg(msg) {
    return msg.delete();
  }
}

module.exports = SpoilerBot;

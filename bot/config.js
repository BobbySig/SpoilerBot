/* --- SpoilerBot Strings --- */

var botConfig = require("./config.json");

class Strings {
  constructor() {
    // Single Characters
    this.PREFIX = botConfig.prefix;
    this.DELINIATOR = botConfig.deliniator;

    // Styling
    this.COLOR = botConfig.color;

    // Commands
    this.CMD_SPOILER = this.PREFIX + botConfig.spoiler_cmd;

    // Premade Messages
    this.HELP_MSG =
      "Hi, I'm SpoilerBot! To have me handle your spoiler, send a message like" +
      ` \`${this.CMD_SPOILER} title ${this.DELINIATOR} spoiler\` where` +
      " `title` is anything you want to show to everyone and `spoiler`" +
      " is anything that you want run through ROT13.";
    this.OVERLENGTH_SPOILER = "Your spoiler is too long, please shorten it.";
    this.OVERLENGTH_TITLE = "Your spoiler's title is too long," +
      " please shorten it to 256 characters or less.";
    this.OVERLENGTH_FOOTER = " Here's your original message:";
    this.FOOTER = "(See <https://rot13.com> to decode.)";
    this.DECODE_URL_BASE = "http://www.decode.org?q=";
  }
}

module.exports = Strings;

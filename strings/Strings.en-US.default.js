'use strict';
/* --- SpoilerBot Strings --- */

class Strings {
  constructor() {
    // Single Characters
    this.PREFIX = "!";
    this.DELINIATOR = "|";

    // Styling
    this.HELP_COLOR = "#5b187c";
    this.SPOILER_COLOR = "#5b187c";
    this.ERROR_COLOR = "#5b187c";

    // Commands
    this.CMD_SPOILER = this.PREFIX + "spoiler";

    // Bot Info
    this.HOMEPAGE = "https://bobbysig.github.io/SpoilerBot/";

    // Help Messages
    this.HELP_TITLE = "SpoilerBot Help";
    this.HELP_MSG =
      "Hi, I'm SpoilerBot! To have me handle your spoiler, send a message like" +
      ` \`${this.CMD_SPOILER} title ${this.DELINIATOR} spoiler\` where` +
      " `title` is anything you want to show to everyone and `spoiler`" +
      " is anything that you want run through ROT13.";

    // Overlength Messages
    this.OVERLENGTH_SPOILER_HEAD = "Your spoiler is too long!";
    this.OVERLENGTH_SPOILER = "Your spoiler is too long, please shorten it.";
    this.OVERLENGTH_TITLE_HEAD = "Your spoiler's title is too long!";
    this.OVERLENGTH_TITLE = "Your spoiler's title is too long," +
      " please shorten it to 256 characters or less.";
    this.OVERLENGTH_FOOTER = " Here's your original message:";

    // Spoiler Messages
    this.FOOTER = "(See <https://rot13.com> to decode.)";
    this.DECODE_URL_BASE = "http://www.decode.org?q=";
  }
}

module.exports = Strings;

const expect = require('chai').expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const ROT13 = require('caesar-salad').ROT13;
const Config = require("./config.js");
const config = new Config();
const SpoilerBot = require('./spoilerbot');

describe('SpoilerBot', function() {
  beforeEach(function() {
    // Create SpoilerBot instance.
    this.bot = new SpoilerBot(new Discord.Client());
  });

  describe('shouldRespond', function() {
    it("should return false if the message is sent by a bot", function() {
      var mockMessage = {
        author: {bot: true}
      };
      expect(this.bot.shouldRespond(mockMessage)).to.equal(false);
    });

    it("should return false if message.channel isn't a Discord.TextChannel", function() {
      var mockMessage = {
        author: {bot: false},
        channel: {}
      };
      expect(this.bot.shouldRespond(mockMessage)).to.equal(false);
    });

    it("should return false if the message doesn't start with '!'", function() {
      var mockMessage = {
        author: {bot: false},
        channel: sinon.createStubInstance(Discord.TextChannel),
        content: "not !"
      };
      expect(this.bot.shouldRespond(mockMessage)).to.equal(false);
    });

    it("should return true if message is a valid command in a valid channel from a non-bot user", function() {
      var mockMessage = {
        author: {bot: false},
        channel: sinon.createStubInstance(Discord.TextChannel),
        content: "!"
      };
      expect(this.bot.shouldRespond(mockMessage));
    });
  });

  describe('handleMsg', function() {
    beforeEach(function () {
      // Create spy for SpoilerBot.processSpoiler.
      this.processSpoilerSpy = sinon.spy();
      this.bot.processSpoiler = this.processSpoilerSpy;

      // Create mock messages.
      var mockChannel = sinon.createStubInstance(Discord.TextChannel);
      this.mockSpoilerMsg = {
        author: {bot: false},
        channel: mockChannel,
        content: "!spoiler"
      };
      this.mockNotSpoilerMsg = {
        author: {bot: false},
        channel: mockChannel,
        content: "!notSpoiler"
      };
      this.mockIgnoreMsg = {
        author: {bot: true},
        channel: mockChannel
      };
    });

    it("should send no response if the message is not a valid command", function() {
      this.bot.handleMsg(this.mockIgnoreMsg);
      expect(this.processSpoilerSpy.called).to.equal(false);
    });

    it("should not call processSpoiler if the message doesn't start with '!spoiler'", function() {
      this.bot.handleMsg(this.mockNotSpoilerMsg);
      expect(this.processSpoilerSpy.called).to.equal(false);
    });

    it("should call processSpoiler if the message is a valid command and starts with '!spoiler'", function() {
      this.bot.handleMsg(this.mockSpoilerMsg);
      expect(this.processSpoilerSpy.calledWithExactly(this.mockSpoilerMsg));
    });
  });

  describe('processSpoiler', function() {
    before(function() {
      this.strings = {
        author: {
          username: "Tester Username",
          displayAvatarURL: "Example Avatar URL"
        },
        title: {
          valid: "title",
          invalid: "5UGDU00XQPNNcCkSaQkZId3as4dZS4WUVyZgzDXc0JdNME8" +
            "KW3ERra97noZ7OyWXbDU8rN1WdovOgHfR1Xd12R6L2bqLQTMiPMRqs" +
            "gaKDqg04sXQjmMnig6n3l2m0xexIsyHe2OiSDjy9rCjbkYs72Ant7g" +
            "4rcapHPdYOtahvj46QiGGUQR9DGtKE25betEdw2bCgtMVPKiGdmrU6" +
            "0iJef4iDv2vt5lK0mkcQ4qmCJuqmB86a81YD76iM1TMXQ09"
        },
        content: {
          valid: "spoiler",
          invalid: "[INSERT TOO LONG]"
        }
      }
    })

    beforeEach(function() {
      // Create spies for SpoilerBot methods that are called by processSpoiler
      this.bot.sendHelpMsg = sinon.spy();
      this.bot.sendTitleTooLongMsg = sinon.spy();
      this.bot.sendSpoilerTooLongMsg = sinon.spy();
      this.bot.sendSpoilerMessage = sinon.spy();

      // Create base message
      this.mockSpoilerMsg = {
        author: {
          bot: false,
          username: this.strings.author.username,
          displayAvatarURL: this.strings.author.displayAvatarURL
        },
        channel: sinon.createStubInstance(Discord.TextChannel),
        content: "THIS MUST BE CHANGED"
      };
    });

    // TODO Test valid spoiler message variants
    it('should call sendSpoilerMessage when the message is a valid full spoiler message', function() {
      var content = config.CMD_SPOILER + " " + this.strings.title.valid + " " +
        config.DELINIATOR + " " + this.strings.content.valid;
      var encoded = ROT13.Cipher().crypt(this.strings.content.valid);
      var url = config.DECODE_URL_BASE + encodeURIComponent(encoded);

      this.mockSpoilerMsg.content = content;
      this.bot.processSpoiler(this.mockSpoilerMsg);

      expect(this.bot.sendHelpMsg.called).to.equal(false);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.calledWithExactlyExactly(
        this.mockSpoilerMsg,
        this.strings.title.valid,
        encoded,
        url,
        this.mockSpoilerMsg.author.username,
        this.mockSpoilerMsg.author.displayAvatarURL
      )).to.equal(true);
    });

    it('should call sendHelpMsg when the message is "!spoiler"', function() {
      // No extra whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER;
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);

      // Extra whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " ";
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);
    });

    it('should call sendHelpMsg when the message is "!spoiler|" or "!spoiler |"', function() {
      // No whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER + config.DELINIATOR;
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);

      // Added whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + config.DELINIATOR;
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);
    });

    it('should call sendHelpMsg when the message is "!spoiler title |" or "!spoiler title | "', function() {
      // No extra whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + this.strings.title.valid + " " +
        config.DELINIATOR;
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);

      // Extra whitespace
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + this.strings.title.valid + " " +
        config.DELINIATOR + " ";
      this.bot.processSpoiler(this.mockSpoilerMsg);
      expect(this.bot.sendHelpMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);
    });

    it('should call sendTitleTooLongMsg when only the title section is over 256 characters', function() {
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + this.strings.title.invalid + " " +
        config.DELINIATOR + " " + this.strings.content.valid;

      expect(this.bot.sendHelpMsg.called).to.equal(false);
      expect(this.bot.sendTitleTooLongMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
      expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);
    });

    // TODO Test "!spoiler title | [too long]"
    it('should call sendSpoilerTooLongMsg when only the spoiler section is too long', function() {
      this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + this.strings.title.valid + " " +
        config.DELINIATOR + " " + this.strings.content.invalid;

      expect(this.bot.sendHelpMsg.called).to.equal(false);
      expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(false);
      expect(this.bot.sendSpoilerMessage.called).to.equal(false);
    });
  });
});

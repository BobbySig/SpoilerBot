const expect = require('chai').expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const Config = require("./config.js");
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
      expect(this.processSpoilerSpy.calledWith(this.mockSpoilerMsg));
    });
  });

  describe('processSpoiler', function() {
    beforeEach(function() {
      // Create spies for SpoilerBot methods that are called by processSpoiler
      this.bot.sendHelpMsg = sinon.spy();
      this.bot.sendTitleTooLongMsg = sinon.spy();
      this.bot.sendSpoilerTooLongMsg = sinon.spy();
      this.bot.sendSpoilerMessage = sinon.spy();

      // Create base message
      this.mockSpoilerMsg = {
        author: {bot: false},
        channel: sinon.createStubInstance(Discord.TextChannel),
        content: "THIS MUST BE CHANGED"
      };
    });

    // TODO Test valid spoiler message variants
    it('should call sendSpoilerMessage when the message is a valid full spoiler message', function() {
      this.mockSpoilerMsg.content = "!spoiler title | spoiler";
      this.bot.processSpoiler(this.mockSpoilerMsg);

      expect(this.bot.sendHelpMsg.called).to.equal(false);
      expect(this.bot.sendTitleTooLongMsg).to.equal(false);
      expect(this.bot.sendSpoilerTooLongMsg).to.equal(false);
      expect(this.bot.sendSpoilerMessage.calledWith())
    });

    // TODO Test "!spoiler" and "!spoiler "
    // TODO Test "!spoiler|" and "!spoiler |"
    // TODO Test "!spoiler title |" and "!spoiler title | "
    // TODO Test "!spoiler [too long] | spoiler"
    // TODO Test "!spoiler title | [too long]"
    // TODO Test "!spoiler [too long] | [too long]"
  });
});

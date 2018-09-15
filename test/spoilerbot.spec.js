const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const ROT13 = require('caesar-salad').ROT13;
const Config = require("../lib/config");
const config = new Config();
const SpoilerBot = require('../lib/spoilerbot');

describe('SpoilerBot', function() {
  beforeEach(function() {
    // Create SpoilerBot instance.
    this.bot = new SpoilerBot(new Discord.Client());
  });

  describe('Message Handlers', function() {
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
              "0iJef4iDv2vt5lK0mkcQ4qmCJuqmB86a81YD76iM1TMXQ09r"
          },
          content: {
            valid: "spoiler",
            invalid: "P2aBAdzgyxyXlb2Ot7aSZgj4jvE16CkzgwuU9KmyiZrer" +
              "oaWYMoZOtTsejQTI5dvAmkEjGNiDcQbUg428my7euhBzuHmWFziibO" +
              "r4bsPuTjaCSTDfqyq69ncFeD1vEL6weQiXmsyL5PP6zc0tCr5EAaee" +
              "uLmzZfcLXIgvgOuAJDiDKaPBEUydznzDXs2GuShp0OFN3SKLVnK2ps" +
              "3gx1PIsyfSkMjUnoOwy0ySLB0EVtMyXeaK5TyxErW2OzPx19hcZreC" +
              "4x5sJdrHMHszuhyjzdpyveTk8DxjJOhBIezp49AFHgsFUeLcYGVGi2" +
              "TaM14bH0YMBAbSbIX7O2zPeawc1h8ho77M0NVrEojJpzQjimcQSqBO" +
              "gwxtXyy4F3RNL28UbRHo6WGaDtCSvkxnzGXNQMsoTFuL5KD743CYlL" +
              "l09uK1or4JH57wt81iX2hkEYIaFqOINawxamiCMTuQC2zXTtsLn9Xv" +
              "dmqQUPhm6YG98QBKQisbi5ndgjrewAj7ksPGT0Slq5TxKHA378bUbF" +
              "GxSZcVxvWjIZ72VxyzIqulQTHMNcXRiRfC9V1L7zUqj6x1wZVudH93" +
              "PHCunyfKl2PPeXPgBJDS8V9queVEiP9BaeYfdJpura41odgtAfgrRt" +
              "1iJmcAad3ysBB7N2h5P8b7aTt3j758z4bUfl87sErmFdOuCE9xvQfV" +
              "u0Wxwug30SG0rwMtOXH39UJJ02NQ0I5Dxh26exTNakcd3Q4c72o9PD" +
              "8Gfk3OZSVEvHKAnzaXYvqbER2Gac2XjMA4t1S3PC3UkU0tqI4dnzrI" +
              "jnfZ3Azi06eJShdfpBYDgt6EEP2Fpq4kow11N8ik3pKLHIngjaKM6Z" +
              "zetWm3Fed8KEd1HcW30WWdk4pE3TOZ9J5XI4F0fbIzcp92ZSjFzLGG" +
              "nvF7wEvBwxl5UtrV8HiH2Gq6eFJf3UG1ct6lFjufOOhntQ2aViIJr5" +
              "w5aKfBSer8SrLIXuSfFngZooYndCPPrrN4EwgBGbOYOKtvSzQ6ro6A" +
              "QYgc0IyJjcJEkoJQTockex9LUHguUfjC1iaIQKMjk0BoJmvJOn3lHJ" +
              "jtsMjrsonhkmUeuY5G2q8d0dpr4tUbmaNttUU11BpjpMCSH7wvHYoW" +
              "2RsEVD4H2x3x9ZpVumraZz8aCQyBVqbXfzmBmSPmDEOtqjDPcIvVPm" +
              "An0cUCJEkf8NiixFN3jo847hBEG8D9EO1hhEj9J7xZHR2qFn4QhCSq" +
              "tI7fNeumejgFvvVENKXkj9yNe352RKX0Ms095EaV82SDUcu2kd7TAv" +
              "MpNFyPPxCRmKcj7MB9zssCWsC0IMjmkCshO8CMxDfLZ9QwcaehFVjp" +
              "AxzMvcM6Q2Qk44g4JfaqUUiTMDFxJQMqtq7FrT7dlJ2xOOWmZfC3Lc" +
              "KDQJYZRI6EkHVKYINeyAXwP1UJsGSlUHNuLoeTURLsDBakYlN9uQLL" +
              "sK3cOIwwLeljEQpSA9TGwlHsswJADcQp5U5n9xEieQ3OoTAbTsqKQ2" +
              "09RqlZIAkPW73cPGUPgJ0TRLPtNdUhes7kFpk7Pf0tMiJus6guilJA" +
              "Y7dPF6VH4zSKdWs2aoTs2sR8VhUaSsVkcy7rOSzNrpdxq0w0pnUhv9" +
              "6INmVXOZrEFlzr7hZMmxMcTBXThluBej3uduDSy1yHv8NIQh9MAVto" +
              "q8Hb0DJzUkD4I8ru15mTIkCNkjlFd4iHp6vqcUYEz1Is0hzYCjudCI" +
              "cMiw4sFXtuA75bLYDMEdv4NSY6zUUYUiB8nZrIDUw4MPuUXo2bhnvu" +
              "9XItCwiTeHEZ3qwefk0MX106lfEb1D59Vm6sHefvXhtWAB5bXeLa56" +
              "pOvfUfkW9eHgySLS5XIXsLUsbmLNzUs9YRCIvdjNz24XnPNltXvVdq" +
              "Dg0QnPFnRvRvJRpaob9zlbsTLE6ppdXZSyKOI2Khsa1ccCXU1OfURb" +
              "IrZXCd8xrCd757asOGWqUvYgitAdodbiiEmy631jPhO9kl7tMcKPs8" +
              "TUoXdvih0sKr"
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
        expect(this.bot.sendSpoilerMessage.called).to.equal(true);
        expect(this.bot.sendSpoilerMessage.calledWithExactly(
          this.mockSpoilerMsg,
          this.strings.title.valid.trim(),
          encoded.trim(),
          url.trim(),
          this.mockSpoilerMsg.author.username.trim(),
          this.mockSpoilerMsg.author.displayAvatarURL.trim()
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
        this.bot.processSpoiler(this.mockSpoilerMsg);

        expect(this.bot.sendHelpMsg.called).to.equal(false);
        expect(this.bot.sendTitleTooLongMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
        expect(this.bot.sendSpoilerTooLongMsg.called).to.equal(false);
        expect(this.bot.sendSpoilerMessage.called).to.equal(false);
      });

      it('should call sendSpoilerTooLongMsg when only the spoiler section is too long', function() {
        this.mockSpoilerMsg.content = config.CMD_SPOILER + " " + this.strings.title.valid + " " +
          config.DELINIATOR + " " + this.strings.content.invalid;
        this.bot.processSpoiler(this.mockSpoilerMsg);

        expect(this.bot.sendHelpMsg.called).to.equal(false);
        expect(this.bot.sendTitleTooLongMsg.called).to.equal(false);
        expect(this.bot.sendSpoilerTooLongMsg.calledWithExactly(this.mockSpoilerMsg)).to.equal(true);
        expect(this.bot.sendSpoilerMessage.called).to.equal(false);
      });
    });
  });

  describe('Message Handling Helpers', function() {
    before(function() {
      // Prep Sinon Spy Injection Methods
      this.prepBothResolve = function() {
        this.bot.sendMsg = sinon.stub().resolves();
        this.bot.deleteMsg = sinon.stub().resolves();
      };
      this.prepSendThrows = function() {
        this.bot.sendMsg = sinon.stub().rejects();
        this.bot.deleteMsg = sinon.stub().resolves();
        console.error = sinon.spy();
      };
      this.prepSendThrowsSecond = function() {
        this.bot.sendMsg = sinon.stub();
        this.bot.sendMsg.onCall(0).resolves();
        this.bot.sendMsg.onCall(1).rejects();
        this.bot.deleteMsg = sinon.stub().resolves();
        console.error = sinon.spy();
      };
      this.prepDeleteThrows = function() {
        this.bot.sendMsg = sinon.stub().resolves();
        this.bot.deleteMsg = sinon.stub().rejects();
        console.error = sinon.spy();
      };
      this.prepBothThrow = function() {
        this.bot.sendMsg = sinon.stub().rejects();
        this.bot.deleteMsg = sinon.stub().rejects();
        console.error = sinon.spy();
      };
      // Prep Test Message
      this.handlingHelperTestMsg = {
        author: 'This is a test.',
        content: 'This is also a test.'
      };
      // Prep identical tests
      this.consoleErrorTwice = function() {
        expect(console.error.calledTwice).to.be.true;
      };
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

    describe('sendTitleTooLongMsg', function() {
      it('sends the title too long error & the original message to the author, then deletes the original', async function() {
        this.prepBothResolve();
        var errMsg = this.bot.errorMsg(this.bot.config.OVERLENGTH_TITLE_HEAD,
          this.bot.config.OVERLENGTH_TITLE,
          this.bot.config.OVERLENGTH_FOOTER);
        await this.bot.sendTitleTooLongMsg(this.handlingHelperTestMsg);
        expect(this.bot.sendMsg.calledTwice).to.equal(true);
        expect(this.bot.sendMsg.getCall(0).args).to.deep.equal([errMsg, this.handlingHelperTestMsg.author]);
        expect(this.bot.sendMsg.getCall(1).args).to.deep.equal([this.handlingHelperTestMsg.content, this.handlingHelperTestMsg.author]);
        expect(this.bot.deleteMsg.calledOnce).to.equal(true);
        expect(this.bot.deleteMsg.getCall(0).args).to.deep.equal([this.handlingHelperTestMsg]);
      });

      it('prints to console.error when sendMsg throws an error when it\'s first called', async function() {
        this.prepSendThrows();
        await this.bot.sendTitleTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when sendMsg throws an error the second time it\'s called', async function() {
        this.prepSendThrowsSecond();
        await this.bot.sendTitleTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when deleteMsg throws an error', async function() {
        this.prepDeleteThrows();
        await this.bot.sendTitleTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when both sendMsg and deleteMsg can throw an error', async function() {
        this.prepBothThrow();
        await this.bot.sendTitleTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });
    });

    describe('sendSpoilerTooLongMsg', function() {
      it('sends the spoiler too long error & the original message to the author, then deletes the original', async function() {
        this.prepBothResolve();
        await this.bot.sendSpoilerTooLongMsg(this.handlingHelperTestMsg);
        expect(this.bot.sendMsg.calledTwice).to.equal(true);
        expect(this.bot.deleteMsg.calledOnce).to.equal(true);
      });

      it('prints to console.error when sendMsg throws an error when it\'s first called', async function() {
        this.prepSendThrows();
        await this.bot.sendSpoilerTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when sendMsg throws an error the second time it\'s called', async function() {
        this.prepSendThrowsSecond();
        await this.bot.sendSpoilerTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when deleteMsg throws an error', async function() {
        this.prepDeleteThrows();
        await this.bot.sendSpoilerTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when both sendMsg and deleteMsg can throw an error', async function() {
        this.prepBothThrow();
        await this.bot.sendSpoilerTooLongMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });
    });

    describe('sendSpoilerMessage', function() {
      it('sends the spoiler message, then deletes the original', async function() {
        this.prepBothResolve();
        await this.bot.sendSpoilerMessage(
          this.handlingHelperTestMsg,
          "Title",
          "EncodedSpoiler",
          "URL",
          this.handlingHelperTestMsg.author,
          "AvatarURL");
        expect(this.bot.sendMsg.calledOnce).to.equal(true);
        expect(this.bot.deleteMsg.calledOnce).to.equal(true);
      });

      it('prints to console.error when sendMsg throws an error when it\'s first called', async function() {
        this.prepSendThrows();
        await this.bot.sendSpoilerMessage(
          this.handlingHelperTestMsg,
          "Title",
          "EncodedSpoiler",
          "URL",
          this.handlingHelperTestMsg.author,
          "AvatarURL");
        this.consoleErrorTwice();
      });

      it('prints to console.error when deleteMsg throws an error', async function() {
        this.prepDeleteThrows();
        await this.bot.sendSpoilerMessage(
          this.handlingHelperTestMsg,
          "Title",
          "EncodedSpoiler",
          "URL",
          this.handlingHelperTestMsg.author,
          "AvatarURL");
        this.consoleErrorTwice();
      });

      it('prints to console.error when both sendMsg and deleteMsg can throw an error', async function() {
        this.prepBothThrow();
        await this.bot.sendSpoilerMessage(
          this.handlingHelperTestMsg,
          "Title",
          "EncodedSpoiler",
          "URL",
          this.handlingHelperTestMsg.author,
          "AvatarURL");
        this.consoleErrorTwice();
      });
    });

    describe('sendHelpMsg', function() {
      it('sends the help message, then deletes the original', async function() {
        this.prepBothResolve();
        await this.bot.sendHelpMsg(this.handlingHelperTestMsg);
        expect(this.bot.sendMsg.calledOnce).to.equal(true);
        expect(this.bot.deleteMsg.calledOnce).to.equal(true);
      });

      it('prints to console.error when sendMsg throws an error when it\'s first called', async function() {
        this.prepSendThrows();
        await this.bot.sendHelpMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when deleteMsg throws an error', async function() {
        this.prepDeleteThrows();
        await this.bot.sendHelpMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });

      it('prints to console.error when both sendMsg and deleteMsg can throw an error', async function() {
        this.prepBothThrow();
        await this.bot.sendHelpMsg(this.handlingHelperTestMsg);
        this.consoleErrorTwice();
      });
    });
  });

  describe('Message Generators', function() {
    describe('helpMsg', function() {
      it('returns a message containing the embed for the help message', function() {
        var embed = new Discord.RichEmbed()
          .setTitle(this.bot.config.HELP_TITLE)
          .setURL(this.bot.config.HOMEPAGE)
          .setColor(this.bot.config.COLOR)
          .setDescription(this.bot.config.HELP_MSG);
        expect({embed}).to.deep.equal(this.bot.helpMsg());
      });
    });

    describe('errorMsg', function() {
      it('returns a rich embed with the requested error message', function() {
        var title = "ErrTitle", msg = "ErrMsg", footer = "ErrFooter";
        var embed = new Discord.RichEmbed()
          .setTitle(title)
          .setColor(this.bot.config.COLOR)
          .setDescription(msg)
          .setFooter(footer);
        expect({embed}).to.deep.equal(this.bot.errorMsg(title, msg, footer));
      });
    });
  });
});

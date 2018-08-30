/* --- Express Site Code --- */

// Init Environment
if (process.env.NODE_ENV !== "production")
  require('dotenv').load();

// Load Imported Code
const Discord = require('discord.js');
const SpoilerBot = require('./bot/spoilerbot');

// Init Express
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Start listening for web requests.
var listener = app.listen(process.env.PORT, function() {
  console.log('Express is listening on port ' + listener.address().port);
});

/* --- Launch SpoilerBot --- */
var client = new Discord.Client();
var bot = new SpoilerBot(client);
bot.start().catch(function(reason) {
  console.error('Error: Discord login failed. Log:');
  console.error(reason);
});

/* --- Express Site Code --- */

// Init Environment
//require('dotenv').load();

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
  console.log('Your app is listening on port ' + listener.address().port);
});

/* --- Load SpoilerBot Code --- */

require('./bot/spoilerbot.js');

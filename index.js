"use strict"
const JustAnotherDiscordBot = require('./justanotherdiscordbot.js')
const config = require('./config.js')
const words = require('./words.js')
const justanotherdiscordbotDb = require('./db_abstraction.js')
const Discord = require('discord.js')
const client = new Discord.Client();
const poosybot = new JustAnotherDiscordBot(client, justanotherdiscordbotDb(), config, words);

process.on('unhandledRejection', function (err) {
    throw err;
});

process.on('uncaughtException', function (err) {
   console.log(err);
});

poosybot.start(process.argv);

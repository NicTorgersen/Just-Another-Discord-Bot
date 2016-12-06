"use strict"
const PoosyBot = require('./poosybot.js')
const config = require('./config.js')
const words = require('./words.js')
const poosybotDb = require('./db_abstraction.js')
const Discord = require('discord.js')
const client = new Discord.Client();
const poosybot = new PoosyBot(client, poosybotDb(), config, words);

process.on('unhandledRejection', function (err) {
    throw err;
});

process.on('uncaughtException', function (err) {
   console.log(err);
});

poosybot.start();

const moment = require('moment')
const config = require('./config.js')

function GameInstance (ending, prize) {
    this.players = {}
    this.ending = ending
    this.ended = false
    this.prize = prize

    // adds a player to the game
    this.addPlayer = function (user) {
        if (this.ended)
            return false

        this.players[user.id] = user

        return true
    }

    // picks a random winner weighted on something later on
    function pickWinner () {
        let pRnd = []

        for (key in this.players) {
            pRnd.push(this.players[key])
        }

        let ticket = Math.floor((Math.random() * pRnd.length) + 1)
        return pRnd[ticket]

    }

}

function Game (dbHandle) {

    /*
    object responsible for holding the games going on
    */
    this.games = {}

    // sets game ending time
    // invoked by a user, so we get the Message object with all its perks
    this.start = function (msg) {
        let channelId = msg.channel.id

        if (!games.hasOwnProperty(channelId)) {
            let game = newGame(channelId, moment().add(3, 's'), config.defaultRaidPrize)
            game.addPlayer(msg.author)
        }

    }


    function newGame (channelId, ending, prize) {
        let game = new GameInstance(ending, prize)
        this.games[channelId] = game

        return game
    }

}

module.exports = Game

const moment = require('moment')

function GameInstance (user, ending, prize) {
    this.players = {}
    this.ending = ending
    this.ended = false
    this.prize = prize

    addPlayer(user)

    // adds a player to the game
    function addPlayer (user) {
        if (!this.ended)
            return false

        if (typeof user === 'object') {
            this.players[user.id] = user
            return true
        }

        return false
    }

    function cycle (time, cb) {
        if (this.ending < time) {
            this.ended = true
            return
        } else {
            setTimeout(function () {
                this.ended = true
                cb(this)
            }, ending.diff(time))
        }

    }
}

function Game () {

    /*
    object responsible for holding the games going on
    */
    let games = {}

    // sets game ending time
    // invoked by a user, so we get the User object
    function start (msg, cb) {

        if (!games.hasOwnProperty(msg.channel.id)) {
            let game = games[msg.channel.id] = new GameInstance(msg.author, moment().add(30, 's'))
            game.cycle(moment(), (gameObj) => {
                if (gameObj.ended || gameObj.ending < moment()) {
                    let winner = pickWinner(gameObj.players)
                    msg.channel.sendMessage("Well, some of you didn't make it. At least @"+winner.username+" got out alive with all the poosyloons.")

                    delete games[msg.channel.id]
                    cb(games)
                    return true
                }
            })

            msg.channel.sendMessage("@" + msg.author.username + " has started a raid.")
            return true
        } else if (games.hasOwnProperty(msg.channel.id) && games[msg.channel.id].ended !== true) {
            cb(games)
            if (game.players.hasOwnProperty(msg.author.id))
                return false

            let game = games[msg.channel.id]
            game.addPlayer(msg.author)
            msg.reply("you're in on it.")

            return true
        }

        return false
    }

    // picks a random winner weighted on something later on
    function pickWinner (players) {
        let winningTicket =  Math.floor((Math.random() * players.length - 1) + 1)

        return players[winningTicket]
    }

    function update () {
        if (games.length > 0) {
            for (let i = 0; i < games.length; i++) {
                let cGame = games[i]

                if (cGame.ended)
                    return

                cGame.tick()
            }
        }
    }

}

module.exports = Game

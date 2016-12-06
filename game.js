const moment = require('moment')

function GameInstance (user, ending, prize) {
    this.players = []
    this.ending = ending
    this.ended = false
    this.prize = prize

    this.players.push(user)

    function cycle (cb) {
        if (this.ending < moment()) {
            this.ended = true
            return
        } else {
            setTimeout()
        }

    }
}

function Game () {

    /*
    object responsible for holding the games going on
    */
    let games = {
        /*'channelId': {
            players: [],
            ending: '',
            ended: '',
        }*/
    }

    // sets game ending time
    // invoked by a user, so we get the User object
    function start (user, channel) {
        if (!games.hasOwnProperty(channel.id)) {
            games[channel.id] = new GameInstance(user, moment().add(30, 's'))
            games[channel.id].cycle()
            return true
        }

        return false
    }

    // picks a random winner weighted on something later on
    function pickWinner (players) {
        let winningTicket =  Math.floor((Math.random() * players.length - 1) + 1)

        return players[winningTicket]
    }

    // adds a player to the game
    function addPlayer (user) {
        if (typeof user === 'object') {
            players.push(user)
            return true
        }

        return false
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

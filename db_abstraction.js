const config = require('./config.js')
const sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databaseName)

module.exports = function () {
    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes*60000);
    }

    return {
        addUser: function (userid, cb) {
            db.get('SELECT id, userid FROM users WHERE userid = ?', [userid], function (err, row) {
                if (typeof row == 'undefined') {
                    var stmt = db.prepare('INSERT INTO users (userid, money) VALUES (?, ?)')
                    stmt.run([userid, config.startMoney], function (err) {
                        cb({success: 'User added to db', lastID: this.lastID})
                    })
                    stmt.finalize()
                } else {
                    cb({error: 'User already exists', errorId: 1})
                }

            })
        },
        getUser: function (userid, cb) {
            db.get('SELECT id, userid, money FROM users WHERE userid = ?', [userid], function (err, row) {
                cb(row)
            })
        },
        newGame: function (userid, cb) {
            db.get('SELECT ending FROM games WHERE id = (SELECT MAX(id) FROM games)', [userid], function (err, row) {
                let current = Date.now()
                let endGame = addMinutes(Date.now()).getTime()
                let randomPrize = Math.floor((Math.random() * 3000) + 1)

                if (row.ending < Date.now()) {
                    db.run('INSERT INTO games (ending, prize, userid) VALUES (?, ?, ?)', [endGame, randomPrize, userid])
                    cb({'game_ends': endGame, 'prize_money': randomPrize})
                } else {
                    cb({'error': 'A raid is already happening', 'errorId': 1})
                }
            })
        }
    }
}

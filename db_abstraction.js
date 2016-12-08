const config = require('./config.js')
const sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databaseName)

module.exports = function () {
    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes*60000);
    }

    function getUserPermission (userid, permissionid, cb) {
        db.get('SELECT id, userid, permission FROM permissions WHERE userid = ? AND permission = ?', [userid, permissionid], function (err, row) {
            if (typeof row == 'undefined') {
                cb(false)
                return
            }
            cb(true)
            return
        })
    }

    function addUser(userid, cb) {
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
    }

    return {
        getUserPermission: getUserPermission,
        addUser: addUser,
        getMoney: function (userid, cb) {
            db.get('SELECT money FROM users WHERE userid = ?', [userid], function (err, row) {
                if (typeof row == 'undefined') {
                    addUser(userid, (ret) => {
                        if(ret.hasOwnProperty('success')) {
                            cb({money: config.startMoney})
                            return
                        }
                    })
                } else {
                    cb(row)
                }
            })
        },
        giveMoney: function (userid, amount, cb) {
            db.get('SELECT id, money FROM users WHERE userid = ?', [userid], function (err, row) {
                if (typeof row == 'undefined') {
                    var stmt = db.prepare('INSERT INTO users (userid, money) VALUES (?, ?)')
                    stmt.run([userid, amount], function (err) {
                        cb({ success: 'User added to db with money ' + amount, lastID: this.lastID })
                    })
                    stmt.finalize()
                } else {
                    var stmt = db.prepare('UPDATE users SET money = (money + ?) WHERE userid = ?')
                    stmt.run([amount, userid], function (err) {
                        console.log(err)
                        cb({ success: 'Updated user in db with money ' + (amount + row.money) })
                    })
                    stmt.finalize()
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

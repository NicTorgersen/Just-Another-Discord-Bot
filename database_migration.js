const config = require('./config.js')
const sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databaseName)

setupDatabase()

function setupDatabase () {
    db.run('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, ending INT, prize INTEGER, winner INTEGER, winnerName TEXT, userid INTEGER, userName TEXT)')
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, userid INTEGER, money INTEGER)')
    db.run('CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, userid INTEGER, permission INTEGER)')
    db.run('CREATE TABLE IF NOT EXISTS strings (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, stringName TEXT, string TEXT, guildId INTEGER)')

    var stmt = db.prepare('INSERT INTO permissions (userid, permission) VALUES (?, ?)')
    stmt.run([133154527477104640, 1], function (err) {
        console.log(err)
    })
    stmt.run([133154527477104640, 2], function (err) {
        console.log(err)
    })
    stmt.finalize()
}

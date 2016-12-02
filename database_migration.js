const config = require('./config.js')
const sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databaseName)

setupDatabase()

function setupDatabase () {
    db.run('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, ending INT, prize INTEGER, winner INTEGER, winnerName TEXT, userid INTEGER, userName TEXT)')
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, userid INTEGER, money INTEGER)')
}

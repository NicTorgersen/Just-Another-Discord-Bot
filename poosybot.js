"use strict"
const XKCDReader = require('./xkcd-reader.js')
const CatFactReader = require('./catfact-reader.js')
const QuoteReader = require('./quote-reader.js')
const YouTubeReader = require('./youtube-reader.js')
const Game = require('./game.js')

function PoosyBot (DiscordClient, dbHandle, config, words) {
    const name = "Martin's Poosy Bot"
    const xkcd = new XKCDReader()
    const cfr = new CatFactReader()
    const quoter = new QuoteReader()
    const youtuber = new YouTubeReader()
    const gameMan = new Game()
    const msgPrefixes = config.messagePrefixes
    const commandPrefixes = config.commandPrefixes

    function start () {
        console.log(name + " started.");

        DiscordClient = bind(DiscordClient);
        DiscordClient.login(config.token)
    }

    function bind (DC) {
        let msgPrefix = config.messagePrefix
        DC.on('ready', () => {
            console.log(name + " is ready for action.")
        })

        DC.on('message', msg => {
            paramRoute(msg)
        })

        return DC
    }

    function paramRoute (msg) {
        const args = msg.content.toLowerCase().replace(/[^\w\s]/gi, '').split(' ')

        if (matchCommandParameterPrefix(args)) {

            switch (args[2]) {
                case 'ping':
                    msg.reply('Pong!')

                    break

                case 'help':
                case 'halp':
                    msg.channel.sendCode('', [
                        'I have a set of very specific commands.',
                        'I may find you, I may kill you, but ultimately these are my commands though...',
                        'Address me with ´poosy pls` or ´poosy please`.',
                        'xkcd:',
                        '- specific {id}, returns a specific xkcd',
                        '- random, returns a random xkcd',
                        '- without any additional parameters it just gives the most recent xkcd',
                        'emote:',
                        '- dunno, sends a "dont know emoticon"',
                        '- lenny, sends a lenny face',
                        'get:',
                        '- money, returns the amount of money you got',
                        'give:',
                        '- link, returns the link to invite this bot to a channel',
                        '- money [amount], if you have permission, give money to a user',
                        'invest or shop:',
                        '- in, keyword before a noun you can buy',
                        '    - apartment, a noun you can buy',
                        'cat:',
                        '- fact, returns a random cat fact',
                        '- pic, returns a random cat pic with random dimensions',
                        'EXAMPLE:',
                        'poosy pls xkcd specific 354',
                        'poosy pls cat fact',
                        'poosy pls cat fact 10',
                    ])
                    break

                case 'raid':
                    gameMan.start(msg, (games) => {
                        console.log(games)
                    })
                    break

                case 'xkcd':
                    switch (args[3]) {
                        case 'specific':
                            if (parseInt(args[4])) {
                                let xkcdId = parseInt(args[4])
                                xkcd.getSpecific(xkcdId, (res) => {
                                    msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + " " + res.img)
                                })
                            }
                            break

                        case 'random':
                            xkcd.getRandom((res) => {
                                msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + " " + res.img)
                            })
                            break

                        default:
                            xkcd.getCurrent((res) => {
                                msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + " " + res.img)
                            })
                            break
                    }
                    break

                // emotes
                case 'emote':
                    switch (args[3]) {
                        case 'lenny':
                            msg.channel.sendMessage('( ͡° ͜ʖ ͡°)')
                            break

                        case 'dunno':
                            msg.channel.sendMessage('¯\\_(ツ)_/¯')
                            break
                    }
                    break

                case 'why':
                    let str = args.slice(3, args.length).join(' ')
                    switch (str) {
                        case 'do you not understand grammar':
                            msg.reply('I do.')
                            break
                        case 'are you so dumb':
                            msg.reply('because im like 100 lines of javascript? XDD')
                            break
                    }
                    break

                case 'give':
                    switch (args[3]) {
                        case 'link':
                            msg.channel.sendMessage("https://discordapp.com/oauth2/authorize?client_id=254081475001974784&scope=bot")
                            break

                        case 'money':
                            dbHandle.getUserPermission(msg.author.id, 1, (hasPermission) => {
                                let amt = parseInt(args[4])
                                let recv = msg.mentions.users.first()

                                if ( hasPermission && !isNaN(amt) ) {
                                    dbHandle.giveMoney(recv.id, amt, (obj) => {
                                        console.log(obj)
                                        msg.reply('gave ' + amt + ' money to a user' )
                                    })
                                } else {
                                    msg.reply('missing permission')
                                }
                            })

                            break
                    }
                    break

                case 'shop':
                case 'invest':
                    shop(args.slice(3, args.length), msg)
                    break

                case 'get':
                    switch (args[3]) {
                        case 'money':
                            let recv = msg.mentions.users.first() || msg.author
                            let mentioned = (typeof msg.mentions.users.first() !== 'undefined')

                            dbHandle.getMoney(recv.id, (obj) => {
                                if (mentioned)
                                    msg.reply(recv.username + " has " + obj.money + " poosyloons.")
                                else
                                    msg.reply("you have " + obj.money + " poosyloons.")
                            })
                    }
                    break

                case 'quote':
                    quote(args.slice(3, args.length), msg)
                    break

                case 'show':
                    if (args[3] === 'vid' || args[3] === 'video') {
                        let search = args.slice(4, args.length+1).join(' ')
                        youtuber.search(search, (res) => {
                            msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' https://www.youtube.com/watch?v=' + res.items[0].id.videoId)
                        })
                    }
                    break

                case 'cat':
                    if (args[3] === 'fact') {
                        if (typeof args[4] !== 'undefined') {
                            let num = parseInt(args[4])
                            let facts = ""
                            cfr.getMore(num, (res) => {
                                for (let i = 0; i < res.facts.length; i++)
                                    res.facts[i] = '- ' + res.facts[i]

                                msg.channel.sendCode('', res.facts)
                            })

                            return
                        }
                        cfr.getRandom((res) => {
                            msg.channel.sendMessage(res.facts[0])
                        })
                    } else if (args[3] === 'pic') {
                        var randomY = Math.floor((Math.random() * 800) + 1) + 100
                        var randomX = Math.floor((Math.random() * 800) + 1) + 100
                        msg.channel.sendMessage('http://placekitten.com/g/' + randomX +'/' + randomY)
                    }
                    break
            }

        }
    }

    function shop (args, msg) {
        switch (args[0]) {
            case 'in':
                if (args[1] === 'apartment') {
                    console.log(msg)
                    msg.author.sendMessage('You bought an apartment')
                    msg.channel.sendMessage(msg.author.username + ' just bought something')
                }
                break

        }
    }

    function quote (args, msg) {
        let search = args.join()
        quoter.get(search, () => {

        })
    }


    function getRandomWord (words, objName) {
        var rnd = Math.floor((Math.random() * getStringsLength(words, objName)) + 1)
        return words[objName][rnd]
    }

    function getStringsLength (words, child) {
        return words[child].length -1
    }

    function matchCommandParameterPrefix (args) {
        for (let i = 0; i < commandPrefixes.length; i++) {
            let commandPrefix = commandPrefixes[i]
            if (args[0] === commandPrefix[0] && args[1] === commandPrefix[1]) {
                return true
            }
        }

        return false
    }

    return {
        start: start
    }
}



module.exports = PoosyBot;

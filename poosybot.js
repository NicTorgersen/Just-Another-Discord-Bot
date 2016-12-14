'use strict'
const XKCDReader = require('./xkcd-reader.js')
const CatFactReader = require('./catfact-reader.js')
const QuoteReader = require('./quote-reader.js')
const YouTubeReader = require('./youtube-reader.js')
const GiphyReader = require('./giphy-reader.js')
const ytdl = require('ytdl-core')
const Game = require('./game.js')
const Permissions = require('./permissions.js').permissions

function PoosyBot (DiscordClient, dbHandle, config, words) {
    const name = 'Martin\'s Poosy Bot'
    const xkcd = new XKCDReader()
    const cfr = new CatFactReader()
    const quoter = new QuoteReader()
    const youtuber = new YouTubeReader()
    const giphyr = new GiphyReader()
    const gameMan = new Game(dbHandle)
    const msgPrefixes = config.messagePrefixes
    const commandPrefixes = config.commandPrefixes
    let cliArgs
    let ytQueue = {}

    function start (args) {
        cliArgs = args
        console.log(name + ' started.');

        DiscordClient = bind(DiscordClient);
        DiscordClient.login(config.token)
    }

    function bind (DC) {
        let msgPrefix = config.messagePrefix
        DC.on('ready', () => {
            let clientUser = DiscordClient.user

            if (cliArgs[2] === 'updatename') {
                let newName = cliArgs[3] || 'MartinsPoosyBot'
                clientUser.setUsername(newName).then(u => console.log('Updated username to ' + u.username)).catch(console.error)
            }

            if (cliArgs[2] === 'updateavatar') {
                let newAvatar = cliArgs[3] || './resources/no-dweebs.png'
                clientUser.setAvatar(newAvatar).then(u => console.log('Updated avatar to ' + newAvatar)).catch(console.error)
            }
            console.log(name + ' is ready for action.')
        })

        DC.on('message', msg => {
            if (msg.author.bot) return
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
                        'Address me with `$` or ´poosy pls`.',
                        'xkcd:',
                        '- specific {id}, returns a specific xkcd',
                        '- random, returns a random xkcd',
                        '- without any additional parameters it just gives the most recent xkcd',
                        'emote:',
                        '- dunno, sends a 'dont know emoticon'',
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
                        'play:',
                        '- search phrase',
                        '- next',
                        'stop:',
                        'stop playing all together',
                        'EXAMPLE:',
                        '$ xkcd specific 354',
                        '$ cat fact',
                        '$ cat fact 10',
                        '$ play queen somebody to love',
                        '$ play next',
                        '$ stop',
                    ])
                    break

                case 'raid':
                    // gameMan.start(msg, (games) => {
                    //     console.log(games)
                    // })
                    break

                case 'clear':
                    if (parseInt(args[3])) {
                        dbHandle.getUserPermission(msg.author.id, Permissions.bulkDelete, (hasPermission) => {
                            if (!hasPermission) {
                                msg.channel.sendMessage('No permission, idiot')
                                return
                            }
                            let num = parseInt(args[3])
                            msg.channel.bulkDelete(num)
                        })
                    }
                    break

                case 'xkcd':
                    switch (args[3]) {
                        case 'specific':
                            if (parseInt(args[4])) {
                                let xkcdId = parseInt(args[4])
                                xkcd.getSpecific(xkcdId, (res) => {
                                    msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' ' + res.img)
                                })
                            }
                            break

                        case 'random':
                            xkcd.getRandom((res) => {
                                msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' ' + res.img)
                            })
                            break

                        default:
                            xkcd.getCurrent((res) => {
                                msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' ' + res.img)
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
                            msg.channel.sendMessage('https://discordapp.com/oauth2/authorize?client_id=254081475001974784&scope=bot')
                            break

                        case 'money':
                            dbHandle.getUserPermission(msg.author.id, Permissions.giveMoney, (hasPermission) => {
                                let amt = parseInt(args[4])
                                let recv = msg.mentions.users.first()

                                if ( hasPermission && !isNaN(amt) ) {
                                    dbHandle.giveMoney(recv.id, amt, (obj) => {
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
                                    msg.reply(recv.username + ' has ' + obj.money + ' poosyloons.')
                                else
                                    msg.reply('you have ' + obj.money + ' poosyloons.')
                            })
                    }
                    break

                case 'quote':
                    quote(args.slice(3, args.length), msg)
                    break

                case 'play':

                    if (args[3] === 'kuk') {
                        playAudioFile(msg, 'resources/audio/6-meter-kuk1.wav', (connection) => {
                            setTimeout(() => {
                                connection.disconnect()
                            }, 3000) // the file is one second long
                        })
                        return
                    }

                    if (args[3] === 'next') {
                        if (ytQueue.hasOwnProperty(msg.guild.id)) {
                            if (ytQueue[msg.guild.id].queue.length > 0) {
                                stopStream(msg, true)
                                playOrQueueStream(msg, [], true, ytQueue[msg.guild.id].connection, (bool) => {
                                    if (true) {}
                                })
                            }
                        }
                        return
                    }

                    let search = args.slice(3, args.length+1).join(' ')
                    youtuber.search(search, (res) => {
                        if (res.banned) {
                            msg.channel.sendMessage('Please, this shit is banned.')
                            return
                        }


                        if (Object.keys(ytQueue).length < 1) {
                            msg.channel.sendMessage('Gonna play some ' + res.items[0].snippet.title + ' for you now. Relax and have a beer.')
                        } else {
                            msg.channel.sendMessage('Queued up some ' + res.items[0].snippet.title + ' for you. Relax and have another beer.')
                        }

                        playOrQueueStream(msg, res, false, (bool) => {
                            if (true) {}
                        })

                    })
                    break

                case 'kill':
                    if (args[3] === 'this' && args[4] === 'shit')
                        stopStream(msg)
                    break
                case 'stop':
                    stopStream(msg)
                    break

                case 'show':
                    if (args[3] === 'playlist') {
                        if (ytQueue.hasOwnProperty(msg.guild.id)) {
                            let qu = []
                            for (let i = 0; i < ytQueue[msg.guild.id].humanReadable.length; i++) {
                                qu.push((i+1) + '. ' + ytQueue[msg.guild.id].humanReadable[i])
                            }
                            msg.channel.sendCode('', qu)
                        } else {
                            msg.channel.sendMessage('Nothing in queue right now, to queue: `poosy pls play [search]`')
                        }
                    }

                    if (args[3] === 'vid' || args[3] === 'video') {
                        let search = args.slice(4, args.length+1).join(' ')
                        youtuber.search(search, (res) => {
                            if (res.banned) {
                                msg.channel.sendMessage('Please, this shit is banned.')
                                return
                            }

                            msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' https://www.youtube.com/watch?v=' + res.items[0].id.videoId)
                        })
                    }

                    if (args[3] === 'gif') {
                        let tag = args.slice(4, args.length+1).join(' ') || 'cat'

                        giphyr.search(tag, (res) => {
                            if (typeof res === 'string') {
                                msg.channel.sendMessage(res)
                            } else {
                                msg.channel.sendMessage(getRandomWord(words, 'beingSmartini') + ' ' + res.image_url)
                            }
                        })
                    }
                    break

                case 'cat':
                    if (args[3] === 'fact') {
                        if (typeof args[4] !== 'undefined') {
                            let num = parseInt(args[4])
                            let facts = ''
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

    function stopStream (msg, soft) {
        let guild = msg.guild
        soft = soft || false

        if (!ytQueue.hasOwnProperty(guild.id)) return

        let connection = ytQueue[guild.id].connection
        let stream = ytQueue[guild.id].stream
        let queue = ytQueue[guild.id].queue
        let humanReadable = ytQueue[guild.id].humanReadable

        if (stream) {
            stream.destroy()

            if (ytQueue[guild.id].dispatcher)
                ytQueue[guild.id].dispatcher.end()

            if (ytQueue[guild.id].timeoutId)
                clearTimeout(ytQueue[guild.id].timeoutId)
        }

        if (connection && !soft) {
            connection.disconnect()
        }

        if (queue.length && !soft) {
            ytQueue[guild.id].queue = []
        }

        if (humanReadable.length && !soft) {
            ytQueue[guild.id].humanReadable = []
        }

        if (!soft) {
            delete ytQueue[guild.id]
        }

    }

    function playOrQueueStream (msg, res, onPlaylist, connection, cb) {
        let guild = msg.guild
        let channel = guild.channels.find('name', 'General')

        if (!onPlaylist) {

            if (!ytQueue.hasOwnProperty(guild.id)) {
                ytQueue[guild.id] = {
                    queue: [],
                    humanReadable: [],
                    connection: '',
                    stream: '',
                    timeoutId: undefined
                }
            }

            ytQueue[guild.id].queue.push('https://www.youtube.com/watch?v=' + res.items[0].id.videoId)
            ytQueue[guild.id].humanReadable.push(res.items[0].snippet.title)

        }

        if (guild.available) {
            channel.join().then((connection) => {
                ytQueue[guild.id].connection = connection

                if (connection.speaking) {
                    return
                }

                let curr = ytQueue[guild.id].queue.shift() // get first element from queue
                let meta = ytdl.getInfo(curr, {}, (err, info) => {

                    if (err) {
                        console.log(err)
                        stopStream(msg, false) // if an error happens, just stop pls
                        return
                    }

                    let stream = ytdl(curr, { filter: 'audioonly' }) // get audioonly stream from youtube
                    let dispatcher = ytQueue[guild.id].dispatcher = connection.playStream(stream, { seek: 0, volume: 1 }) // we need dispatcher to end stream later

                    ytQueue[guild.id].stream = stream

                    ytQueue[guild.id].timeoutId = setTimeout(() => {
                        dispatcher.end()
                        stream.destroy()
                        ytQueue[guild.id].humanReadable.shift()

                        if (ytQueue[guild.id].queue.length != 0) {
                            playOrQueueStream(msg, res, true, connection, () => {})
                        } else {
                            stopStream(msg, false)
                        }

                    }, info.length_seconds * 1000)
                })
            })

        }
    }

    function playAudioFile (msg, filePath, cb) {
        let guild = msg.guild
        let channel = guild.channels.find('name', 'General')

        if (!ytQueue.hasOwnProperty(guild.id)) {
            ytQueue[guild.id] = {
                queue: [],
                humanReadable: [],
                connection: '',
                stream: '',
                timeoutId: undefined
            }
        }

        channel.join().then((connection) => {
            let dispatcher = connection.playFile(filePath)
            cb(connection)
        })
    }

    function shop (args, msg) {
        switch (args[0]) {
            case 'in':
                if (args[1] === 'apartment') {
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
            if (commandPrefix.length === 1 && args[0] === commandPrefix[0]) {
                return true
            }

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

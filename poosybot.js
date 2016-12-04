"use strict"
const XKCDReader = require('./xkcd-reader.js')
const CatFactReader = require('./catfact-reader.js')

function PoosyBot (DiscordClient, dbHandle, config, words) {
    const name = "Martin's Poosy Bot"
    const xkcd = new XKCDReader()
    const cfr = new CatFactReader()
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
        const args = msg.content.split(' ')

        if (matchCommandParameterPrefix(args)) {

            switch (args[2]) {
                case 'help':
                case 'halp':
                    msg.channel.sendCode('javascript', [
                        'I have a set of very specific commands.',
                        'I may find you, I may kill you, but ultimately these are my commands though...',
                        'Address me with ´poosy pls` or ´poosy please`.',
                        'xkcd:',
                        '- specific {id}, returns a specific xkcd',
                        '- random, returns a random xkcd',
                        '- without any additional parameters it just gives the most recent xkcd',
                        'dunno:',
                        '- emote, sends a "dont know emoticon"',
                        'give:',
                        '- link, returns the link to invite this bot to a channel',
                        'cat:',
                        '- fact, returns a random cat fact',
                        '- pic, returns a random cat pic with random dimensions',
                        'EXAMPLE:',
                        'poosy pls xkcd specific 354',
                        'poosy pls dunno emote',
                        'poosy pls cat fact',
                        'poosy pls cat fact 10',
                    ])
                    break

                case 'raid':
                    msg.channel.sendMessage('ok. but no. sorry.')
                    break

                case 'xkcd':
                    switch (args[3]) {
                        case 'specific':
                            if (parseInt(args[4])) {
                                let xkcdId = parseInt(args[4])
                                xkcd.getSpecific(xkcdId, (res) => {
                                    var randomWord = Math.floor((Math.random() * getStringsLength(words, 'beingSmartini')) + 1)
                                    msg.channel.sendMessage(words.beingSmartini[randomWord] + " " + res.img)
                                })
                            }
                            break

                        case 'random':
                            xkcd.getRandom((res) => {
                                var randomWord = Math.floor((Math.random() * getStringsLength(words, 'beingSmartini')) + 1)
                                msg.channel.sendMessage(words.beingSmartini[randomWord] + " " + res.img)
                            })
                            break

                        default:
                            xkcd.getCurrent((res) => {
                                var randomWord = Math.floor((Math.random() * getStringsLength(words, 'beingSmartini')) + 1)
                                msg.channel.sendMessage(words.beingSmartini[randomWord] + " " + res.img)
                            })
                            break
                    }
                    break

                case 'dunno':
                    if (args[3] === 'emote')
                        msg.channel.sendMessage('¯\\_(ツ)_/¯')
                    break

                case 'give':
                    if (args[3] === 'link')
                        msg.channel.sendMessage("https://discordapp.com/oauth2/authorize?client_id=254081475001974784&scope=bot")
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

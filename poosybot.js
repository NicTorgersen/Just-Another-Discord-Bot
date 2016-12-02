"use strict"
const XKCDReader = require('./xkcd-reader.js')
const CatFactReader = require('./catfact-reader.js')

function PoosyBot (DiscordClient, dbHandle, config, words) {
    const name = "Martin's Poosy Bot"
    const xkcd = new XKCDReader()
    const cfr = new CatFactReader()
    const msgPrefixes = config.messagePrefixes

    function start () {
        console.log(name + " started.");

        DiscordClient = bind(DiscordClient);
        auth();
    }

    function bind (DC) {
        let msgPrefix = config.messagePrefix
        DC.on('ready', () => {
            console.log(name + " is ready for action.")
        })

        DC.on('message', msg => {
            if (matchCommandPrefix(msg.content)) {
                route(msg)
            }
        })

        return DC
    }

    function auth () {
        DiscordClient.login(config.token)
    }

    function route (msg) {
        let msgPrefix = config.messagePrefix

        // COMMANDS WITH PARAMETERS
        //if ()

        // GET SOMETHING COMMANDS
        switch (getCommandString(msg.content)) {
            case 'cat pic':
            case 'cat':
                var randomY = Math.floor((Math.random() * 800) + 1)
                var randomX = Math.floor((Math.random() * 800) + 1)
                msg.channel.sendMessage('http://placekitten.com/g/' + randomX +'/' + randomY)
                break;

            case 'start new raid':
                var randomWord = Math.floor((Math.random() * getStringsLength(words, 'startNewRaid')) + 1)
                msg.channel.sendMessage(words.startNewRaid[randomWord])

                break

            case 'get todays xkcd':
            case 'get me todays xkcd':
            case 'latest xkcd':
            case 'xkcd':
                xkcd.getCurrent((res) => {
                    var randomWord = Math.floor((Math.random() * getStringsLength(words, 'beingSmartini')) + 1)
                    msg.channel.sendMessage(words.beingSmartini[randomWord] + " " + res.img)
                })

                break

            case 'get random xkcd':
            case 'get me random xkcd':
            case 'random xkcd':
                xkcd.getRandom((res) => {
                    var randomWord = Math.floor((Math.random() * getStringsLength(words, 'beingSmartini')) + 1)
                    msg.channel.sendMessage(words.beingSmartini[randomWord] + " " + res.img)
                })

                break

            case 'get me dunno emoticon':
            case 'dunno':
            case 'i dont know':
                msg.channel.sendMessage('¯\\_(ツ)_/¯')

                break

            case 'cum for me':
            case 'cum':
                var randomWord = Math.floor((Math.random() * getStringsLength(words, 'cumForMe')) + 1)
                msg.channel.sendMessage(words.cumForMe[randomWord])

                break

            case 'give cat fact':
            case 'cat fact':
                cfr.getRandom((res) => {
                    msg.channel.sendMessage(res.facts[0])
                })

                break

            case 'who da best?':
                msg.channel.sendMessage("Mal'Damba, of course")

                break

            case 'how long is my penis?':
            case 'how long is my dick?':
            case 'how long is my penis':
            case 'how long is my dick':
            case 'my dicksize':
                var author = msg.author.username
                var validNames = ['Nic', 'Mal\'Damba']
                if (validNames.indexOf(author) !== -1) {
                    msg.channel.sendMessage(author + " has a huge dick.")
                } else {
                    msg.channel.sendMessage(author + " has a tiny dick.")
                }


                break

            case 'give add link':
            case 'give link':
                msg.channel.sendMessage("https://discordapp.com/oauth2/authorize?client_id=254081475001974784&scope=bot")

                break

            case false:
                msg.channel.sendMessage('Sorry cunt, I\'m afraid I can\'t fucking do that.')

                break
        }
    }

    function getStringsLength (words, child) {
        return words[child].length -1
    }

    function matchCommandPrefix (str) {
        for (let i = 0; i < msgPrefixes.length; i++) {
            let msgPrefix = msgPrefixes[i]

            if (str.indexOf(msgPrefix) === 0) {
                return true
            }
        }
        return false
    }

    function getCommandString (str) {
        for (let i = 0; i < msgPrefixes.length; i++) {
            let msgPrefix = msgPrefixes[i]

            if (str.indexOf(msgPrefix) === 0) {
                return str.substring(msgPrefix.length + 1)
            }
        }

        return false
    }

    return {
        start: start
    }
}



module.exports = PoosyBot;

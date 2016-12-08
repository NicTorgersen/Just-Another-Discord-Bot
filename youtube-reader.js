"use strict"
const http = require('http')
const config = require('./config')
const YouTube = require('youtube-node')

function YouTubeReader () {
    let url = config.youtubeApiUrl + 'search'
    let youTube = new YouTube()

    youTube.setKey(config.youtubeApiKey)
    youTube.addParam('safeSearch', 'none')


    function search (textSearch, cb) {
        if (textSearch.length < 1) {
            cb({err: 'No search'})
            return
        }

        youTube.search(textSearch, 1, (err, result) => {
            result.banned = false
            if (config.bannedYoutubeIds.indexOf(result.items[0].id.videoId) > -1) {
                result.banned = true
                cb(result)
            } else {
                cb(result)
            }

            return
        })
    }

    return {
        search: search,
    }
}

module.exports = YouTubeReader

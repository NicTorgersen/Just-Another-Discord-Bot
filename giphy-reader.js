"use strict"
const http = require('http')

function GiphyReader () {
    let url = 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag='

    function search (tag, cb) {
        http.get(url + tag, (result) => {
            let body = ""

            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                let res = JSON.parse(body.toString())
                if (res.meta.status !== 200) {
                    cb("An error happened.")
                } else {
                    cb(res.data)
                }
            })
        })
    }


    return {
        search: search,
    }
}

module.exports = GiphyReader

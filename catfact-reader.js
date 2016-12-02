"use strict"
const http = require('http')

function CatFactReader () {
    function getRandom (cb) {
        let url = 'http://catfacts-api.appspot.com/api/facts'
        http.get(url, (result) => {
            let body = ""

            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                let response = JSON.parse(body.toString())
                cb(response)
            })
        })
    }

    return {
        getRandom: getRandom
    }
}

module.exports = CatFactReader

"use strict"
const http = require('http')

function CatFactReader () {
    let url = 'http://catfacts-api.appspot.com/api/facts'

    function getMore (num, cb) {
        if (num > 10)
            num = 10

        if (num < 1)
            num = 1

        http.get(url + '?number=' + num, (result) => {
            let body = ""

            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                cb(JSON.parse(body.toString()))
            })
        })
    }

    function getRandom (cb) {
        http.get(url, (result) => {
            let body = ""

            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                cb(JSON.parse(body.toString()))
            })
        })
    }

    return {
        getMore: getMore,
        getRandom: getRandom,
    }
}

module.exports = CatFactReader

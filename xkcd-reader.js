"use strict"
const https = require('https')

function XKCDReader () {
    function getCurrent (cb) {
        https.get('https://xkcd.com/info.0.json', (result) => {
            let body = ""

            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                cb(JSON.parse(body.toString()))
            })
        })
    }

    function getSpecific (id, cb) {
        let idRegex = /^([0-9]+)$/
        if (idRegex.test(id)) {
            let url = 'https://xkcd.com/' + id + '/info.0.json'
            https.get(url, (result) => {
                let body = ""

                result.on('data', (chunk) => {
                    body += chunk
                })

                result.on('end', () => {
                    cb(JSON.parse(body.toString()))
                })
            })
        }
    }

    function getRandom (cb) {
        // Make HTTP request and handle response
        getCurrent((res) => {
            let rnd = Math.floor((Math.random() * res.num) + 1)
            let url = 'https://xkcd.com/' + rnd + '/info.0.json'
            https.get(url, (result) => {
                let body = ""

                result.on('data', (chunk) => {
                    body += chunk
                })

                result.on('end', () => {
                    cb(JSON.parse(body.toString()))
                })
            })
        })
    }

    return {
        getCurrent: getCurrent,
        getSpecific: getSpecific,
        getRandom: getRandom
    }
}

module.exports = XKCDReader

"use strict"
const http = require('http')

function CatFactReader () {
    let url = 'https://en.wikiquote.org/w/api.php' // ?action=opensearch&search=john'
    let params = {
        action: 'opensearch',
        search: '',
        limit: 1,
    }

    function get (search, cb) {
        url = url + makeQueryString(params)
        console.log(url)

        // http.get(url + '?number=' + num, (result) => {
        //     let body = ""
        //
        //     result.on('data', (chunk) => {
        //         body += chunk
        //     })
        //
        //     result.on('end', () => {
        //         cb(JSON.parse(body.toString()))
        //     })
        // })
    }

    function makeQueryString (params) {
        let str = ''
        for (key in params) {
            if (str.length < 1) {
                str += '?'
            } else {
                str += '&'
            }

            str += key + '=' + params[key]
        }
        return str
    }

    return {
        get: get,
    }
}

module.exports = CatFactReader

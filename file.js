const request = require('request')
const ProgressFile = require('butter-streamer/progress/file')
const debug = require('debug')('butter-streamer-http:file')

class HttpFile extends ProgressFile {
    constructor(source, {length, type, name}) {
        super(length)

        this.source = source
        this.length = length
        this.path = type
        this.name = name

        debug('http file', source, length, type, name)
    }

    _createReadStream(range) {
        debug('createReadStream', range)

        const headers = range ? {headers: {
            'Range': 'bytes='
                   + parseInt(range.start) + '-'
                   + (range.end !== undefined ? parseInt(range.end) : '')
        }} : null

        const options = Object.assign({encoding: null}, headers)

        this.stream = request(this.source, options)
        this.stream.on('response', this.streamReady.bind(this))

        return this.stream
    }

    streamReady(res) {
        this.ready = true

        debug('ready', this.source, res.headers)
        this.emit('ready', this.stream)
    }
}

module.exports = HttpFile

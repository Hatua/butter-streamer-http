const request = require('request')
const debug = require('debug')('butter-streamer-http')

const HttpFile = require('./file')

const Streamer = require('butter-streamer')
const config = {
  name: 'HTTP Streamer',
  protocol: /https?/,
  type: 'http',
  priority: 100
}

/* -- HTTP Streamer -- */
class HttpStreamer extends Streamer {
  constructor (source, options = {}) {
    super(source, options, config)
  }

  initialize (source, options) {
    debug ('http stream', source, options)
    return new Promise((resolve, reject) => {
      this.stream = request.head(source)
      this.stream.on('response', res => {
        this.name = source.split('/').pop().split('?').shift()
        const info = {
          length: Number(res.headers['content-length']),
          type: res.headers['content-type'],
          name: this.name
        }
        resolve([new HttpFile(source, info)])
      })
    })
  }
}

HttpStreamer.config = config

module.exports = HttpStreamer

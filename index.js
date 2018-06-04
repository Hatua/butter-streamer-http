const request = require('request')
const debug = require('debug')('butter-streamer-http')

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

  createStream (source, opts) {
    return new Promise ((accept, reject) => {
      const headers = opts ? {headers: {
        'Range': 'bytes='
               + parseInt(opts.start) + '-'
               + (opts.end !== undefined ? parseInt(opts.end) : '')
      }} : null

      const options = Object.assign({encoding: null}, this.options.http, headers)
      debug('req', options)
      this._req = request(source, options)
      this._req.on('response', (res) => {
        const file = {
          length: Number(res.headers['content-length']),
          type: res.headers['content-type'],
          name: source.split('/').pop().split('?').shift()
        }

        if (!file.length) {
          reject (new Error('stream didnt return a length, is it seekeable ?'))
        }

        accept({
          stream: this._req,
          file,
        })
      })
    })
  }

  destroy () {
    super.destroy()
    if (this._req) { this._req.destroy() }
    this._req = null
  }
}

HttpStreamer.config = config

module.exports = HttpStreamer

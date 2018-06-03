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
    super(options)

    this.request = request.defaults({
      encoding: null
    })

    this.config = config

    this._options = options
    this._source = source

    this._req = this.request(source, options.http)
    this._req.on('response', (res) => {
      const length = Number(res.headers['content-length'])
      debug('got response', length)

      if (length) {
        this.ready(this._req, {length,})
      }
    })
  }

  seek (start = 0, end) {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')

    if (this._req) { this._req.destroy() }

    this._req = this.request(this._source, {
      headers: {
        'Range': 'bytes=' + start + '-' + (end !== undefined ? end : '')
      }
    }).on('response', (res) => {
      const length = Number(res.headers['content-length'])
      this.reset(this._req, {length,})
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

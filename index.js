const request = require('request')
const debug = require('debug')('butter-streamer-http')

const Streamer = require('butter-base-streamer')
const config = {
  name: 'HTTP Streamer',
  protocol: /https?/,
  type: 'http',
  priority: 100
}

/* -- HTTP Streamer -- */
class HttpStreamer extends Streamer {
  constructor (source, options) {
    super(options)
    options = options || {}

    this.request = request.defaults({
      encoding: null
    })

    this.config = config

    this._options = options
    this._source = source
    this._req = this.request(source, options.http)
    this._req.on('response', (res) => {
      var length = this._req.getHeader('content-length', res.headers)
      debug('got response', length)

      if (length !== undefined) {
        this._progress.setLength(parseInt(length))
      }

      this._isReady({
        length: length
      })
    })
    this._streamify.resolve(this._req)
  }

  seek (start, end) {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')

    var self = this
    start = start || 0

    if (this._req) { this._req.destroy() }

    this._req = this.request(this._source, {
      headers: {
        'Range': 'bytes=' + start + '-' + (end !== undefined ? end : '')
      }
    }).on('response', function (res) {
      var length = self._req.getHeader('content-length', res.headers)
      if (length !== undefined) { self._progress.setLength(parseInt(length)) }
    })

    this._streamify.unresolve()
    this._streamify.resolve(this._req)
  }

  destroy () {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')

    if (this._req) { this._req.destroy() }
    this._streamify.unresolve()
    this._req = null
    this._destroyed = true
    this.file = {}
  }
}

HttpStreamer.config = config

module.exports = HttpStreamer

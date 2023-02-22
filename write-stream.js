const { Writable } = require('node:stream');
module.exports = class WritableStream extends Writable {
  constructor(logger, level="info"){
    super()
    this.logger = logger
    this.level = level
  }
  _write(data, enc, cb){
    const {logger} = this
    const i = logger.levels.indexOf(this.level)
    const stream = logger.streams[i]
    if (i > logger.level || !stream) {
      return
    }
    return stream.write(data, enc, cb)
  }
}
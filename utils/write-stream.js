const { Writable } = require('node:stream');

module.exports = class WriteStream extends Writable {
  constructor(config={}){
    super()
    const {logger, level="info", raw=false} = config
    this.logger = logger
    this.level = level
    this.raw = raw
  }
  _write(data, enc, cb){
    const {
      logger,
      level,
      raw,
    } = this
    if(raw) {
      const i = logger.levels.indexOf(level)
      const stream = logger.streams[i]
      if (i > logger.level || !stream) {
        return
      }
      return stream.write(data, enc, cb)
    } else {
      return logger[level](data, {}, cb)
    }
  }
}
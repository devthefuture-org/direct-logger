const { Writable } = require('node:stream');
module.exports = class WritableStream extends Writable {
  constructor(config={}){
    super()
    const {logger, level="info", raw=false, splitLines=true} = config
    this.logger = logger
    this.level = level
    this.raw = raw
    this.splitLines = splitLines
  }
  _write(data, enc, cb){
    const {
      logger,
      level,
      raw,
      splitLines,
    } = this
    if(raw) {
      const i = logger.levels.indexOf(level)
      const stream = logger.streams[i]
      if (i > logger.level || !stream) {
        return
      }
      return stream.write(data, enc, cb)
    } else if(splitLines) {
      const lines = data.toString().split("\n")
      Promise.all(lines.map(line=>{
        return new Promise(resolve=>{
          logger[level](line, {}, resolve)
        })
      })).then(()=>{
        cb()
      })
    } else {
      logger[level](data, {}, cb)
    }
  }
}
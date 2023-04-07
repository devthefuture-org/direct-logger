const { Writable } = require("node:stream")

const Deferred = require("./deferred")

class StreamCombiner extends Writable {
  constructor(...streams) {
    super()
    this.streams = streams
    this.ended = false
  }

  end(...args){
    this.ended = true
    super.end(...args)
    for (const stream of this.streams) {
      stream.end(...args)
    }
  }

  _write(data, _enc, cb) {
    if(this.ended){
      return
    }
    const promises = []
    for (const stream of this.streams) {
      const deferred = new Deferred()
      stream.write(data, deferred.resolve)
      promises.push(deferred.promise)
    }
    Promise.all(promises).then(() => cb())
  }
}

module.exports = (...args) => new StreamCombiner(...args)

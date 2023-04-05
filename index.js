const WriteStream = require("./utils/write-stream")
const removeAllAnsiColors = require("./utils/remove-all-ansi-colors")
const ErrorContext = require("./utils/error-context")
const streamCombiner = require("./utils/stream-combiner")
const streamTransformer =require("./utils/stream-transformer")

function Logger (options) {
  if (!(this instanceof Logger)) {
    return new Logger(options)
  }
  const opts = options || {}

  this.options = opts

  this.levels = opts.levels || Logger.levels
  this.streams = opts.streams || Logger.defaultOptions.streams
  this.levels.forEach((level, i) => {
    this[level] = this.log.bind(this, level)

    // Set write stream for level
    this.streams[i] = this.streams[i] || this.streams
  })

  let formatter = opts.formatter || Logger.defaultOptions.formatter
  if (typeof formatter === 'string') {
    const formatterFactory = require(`${__dirname}/formatters/${formatter}`)
    formatter = formatterFactory({...this.options, logger: this})
  }
  this.formatter = formatter

  if (isFinite(opts.level)) {
    this.level = opts.level
  } else if (typeof opts.level === 'string' && this.levels.includes(opts.level)) {
    this.level = this.levels.indexOf(opts.level)
  } else {
    this.level = Logger.defaultOptions.level
  }

  this.fields = opts.fields || Logger.defaultOptions.fields

  this.secrets = new Set(opts.secrets) || Logger.defaultOptions.secrets
  this.secretsHideCharsCount = opts.secretsHideCharsCount || Logger.defaultOptions.secretsHideCharsCount
  this.secretsStringSubstition = opts.secretsStringSubstition || Logger.defaultOptions.secretsStringSubstition
  this.secretsRepeatCharSubstition = opts.secretsRepeatCharSubstition || Logger.defaultOptions.secretsRepeatCharSubstition
  
  this.enforceLinesSeparation = opts.enforceLinesSeparation || Logger.defaultOptions.enforceLinesSeparation
  this.setIndentation(opts.indentation || Logger.defaultOptions.indentation)
  this.indentMultiline = opts.indentMultiline || Logger.defaultOptions.indentMultiline
  this.setIndentMultilinePadding(opts.indentMultilinePadding || Logger.defaultOptions.indentMultilinePadding)
  this.prefixMultiline = opts.prefixMultiline || Logger.defaultOptions.prefixMultiline
  this.suffixMultiline = opts.prefixMultiline || Logger.defaultOptions.suffixMultiline
  this.prefix = opts.prefix || Logger.defaultOptions.prefix
  this.suffix = opts.suffix || Logger.defaultOptions.suffix
  this.trim = opts.trim || Logger.defaultOptions.trim
  this.skipEmptyMsg = opts.skipEmptyMsg || Logger.defaultOptions.skipEmptyMsg
}

Logger.levels = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace'
]

Logger.levels.forEach(function (level, i) {
  Logger[level.toUpperCase()] = i
})

Logger.defaultOptions = {
  level: Logger.INFO,
  formatter: require('./formatters/default')(),
  streams: typeof window === 'undefined' ? Logger.levels.map(function (level, i) {
    return i >= Logger.WARN ? process.stdout : process.stderr
  }) : Logger.levels.map(function (level, i) {
    return i > Logger.WARN ? {
      write: function (msg, encoding, done) {
        console.log(msg)
        if (typeof done === 'function') {
          done()
        }
      }
    } : {
      write: function (msg, encoding, done) {
        console.error(msg)
        if (typeof done === 'function') {
          done()
        }
      }
    }
  }),
  fields: {},
  secrets: [],
  secretsHideCharsCount: false,
  secretsStringSubstition: '***',
  secretsRepeatCharSubstition: '*',
  enforceLinesSeparation: true,
  indentation: 0,
  indentMultiline: false,
  indentMultilinePadding: false,
  prefixMultiline: false,
  suffixMultiline: false,
  prefix: "",
  suffix: "",
  trim: true,
  skipEmptyMsg: true,
}

Logger.prototype.child = function (fields = {}, options = {}) {
  return new Logger({
    ...this.options,
    level: this.level,
    ...options,
    fields: {
      ...this.fields,
      ...fields
    }
  })
}

Logger.prototype.setFields = function (fields) {
  return this.fields = fields
}

Logger.prototype.getFields = function () {
  return this.fields
}

Logger.prototype.setSecrets = function (secrets) {
  return this.secrets = new Set(secrets)
}

Logger.prototype.addSecret = function (secret) {
  return this.secrets.add(secret)
}

Logger.prototype.deleteSecret = function (secret) {
  return this.secrets.delete(secret)
}

Logger.prototype.hasSecret = function (secret) {
  return this.secrets.hasSecret(secret)
}

Logger.prototype._setIndentationPadding = function () {
  this.indentationPadding = this.indentMultilinePadding && this.prefix ? `${" ".repeat(removeAllAnsiColors(this.prefix).length)}` : ""
}

Logger.prototype.setIndentMultilinePadding = function (indentMultilinePadding) {
  this.indentMultilinePadding = indentMultilinePadding
  this._setIndentationPadding()
}

Logger.prototype.setEnforceLinesSeparation = function (b) {
  this.enforceLinesSeparation = b
}
Logger.prototype.setIndentMultiline = function (b) {
  this.indentMultiline = b
}
Logger.prototype.setPrefixMultiline = function (b) {
  this.prefixMultiline = b
}
Logger.prototype.setSuffixMultiline = function (b) {
  this.suffixMultiline = b
}

Logger.prototype.setIndentation = function (indentation) {
  this.indentation = indentation
  this.indentationString = `${" ".repeat(this.indentation)}`
}

Logger.prototype.getIndentation = function () {
  return this.indentation
}

Logger.prototype.setPrefix = function (prefix) {
  this.prefix = prefix
  this._setIndentationPadding()
}

Logger.prototype.getPrefix = function () {
  return this.prefix
}

Logger.prototype.setSuffix = function (suffix) {
  this.suffix = suffix
}

Logger.prototype.getSuffix = function () {
  return this.suffix
}

Logger.prototype.setLevel = function (level) {
  this.level = (typeof level === 'string') ? this.levels.indexOf(level) : level
}

Logger.prototype.getLevel = function () {
  return this.levels[this.level]
}

Logger.prototype.getLevelIndex = function () {
  return this.level
}


Logger.prototype.minLevel = function (level) {
  const newLevel = (typeof level === 'string') ? this.levels.indexOf(level) : level
  if (newLevel > this.level) {
    this.level = newLevel
    return true
  }
  return false
}

Logger.prototype.maxLevel = function (level) {
  const newLevel = (typeof level === 'string') ? this.levels.indexOf(level) : level
  if (newLevel < this.level) {
    this.level = newLevel
    return true
  }
  return false
}

Logger.prototype.createStream = function (config = {}) {
  config = {
    logger: this,
    level: Logger.INFO,
    ...config
  }
  return new WriteStream(config)
}

Logger.prototype.log = function (level, msg, extra, done) {
  // Require a level, matching output stream and that
  // it is greater then the set level of logging
  const i = this.levels.indexOf(level)

  if (
    typeof level !== 'string' ||
    i > this.level ||
    !this.streams[i]
    ) {
      return
  }
  
  if(msg instanceof Buffer) {
    msg = msg.toString()
  }
  
  if (typeof extra === 'string' || (typeof msg === 'object' && !(msg instanceof Error))) {
    const tmpExtra = msg
    msg = extra
    extra = tmpExtra
  }

  if(msg===undefined){
    msg = ""
  }

  // Extra is optional
  if (typeof extra === 'function') {
    done = extra
    extra = {}
  }
  const data = {
    ...(this.fields),
    ...(extra || {})
  }

  // Set message on extra object
  const isErrorInstance = msg instanceof Error
  data.msg = isErrorInstance ? (msg.message || "") : msg
  if(msg?.code){
    data.code = msg.code
  }

  // If this is an error, copy over other properties on the error
  if (isErrorInstance) {
    for (const key in msg) {
      if (Object.prototype.hasOwnProperty.call(msg, key)) {
        data[key] = msg[key]
      }
    }
  }

  // Lazy create error
  let err
  Object.defineProperty(data, 'err', {
    enumerable: true,
    configurable: true,
    get: () => {
      err = err || ErrorContext(Logger, msg)
      return err
    }
  })

  if(typeof data.msg!=="string"){
    data.msg = data.msg.toString()
  }
  
  if(this.trim) {
    data.msg = data.msg.trim()
  }
  if(this.skipEmptyMsg && data.msg.length === 0){
    done && done()
    return
  }

  // Format the message
  const message = this.formatter(new Date(), level, data)

  // Write out the message
  if(this.enforceLinesSeparation && typeof message === "string"){
    const lines = message.split('\n')
    for(const line of lines){
      if(line.trim().length === 0){
        continue
      }
      this._write(this.streams[i], line+"\n", 'utf8')
    }
    if(typeof done === "function"){
      done()
    }
  } else {
    this._write(this.streams[i], message, 'utf8', done)
  }
}

// Abstracted out the actual writing of the log so it can be eaisly overridden in sub-classes
Logger.prototype._write = function (stream, msg, enc, done) {
  stream.write(msg, enc, done)
}

Logger.prototype.end = async function () {
  return Promise.all(
    this.streams.map((stream) => {
      stream.end()
      return new Promise((resolve) => {
        stream.once("finish", () => {
          resolve()
        })
      })
    })
  )
}

module.exports = new Logger()

module.exports.Logger = Logger

module.exports.streamCombiner = streamCombiner

module.exports.streamTransformer = streamTransformer
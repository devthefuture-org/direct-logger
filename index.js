const WriteStream = require("./write-stream")

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
    formatter = formatterFactory(this.options)
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
  
  this.indentation = opts.indentation || Logger.defaultOptions.indentation
  this.prefix = opts.prefix || Logger.defaultOptions.prefix
  this.suffix = opts.suffix || Logger.defaultOptions.suffix
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
  indentation: 0,
  prefix: "",
  suffix: "",
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

Logger.prototype.setIndentation = function (indentation) {
  this.indentation = indentation
}

Logger.prototype.getIndentation = function () {
  return this.indentation
}

Logger.prototype.setPrefix = function (prefix) {
  this.prefix = prefix
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

Logger.prototype.getStream = function (level=Logger.INFO) {
  if(!this.loggerStream){    
    this.loggerStream = new WriteStream(this, level)
  }
  return this.loggerStream
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

  if (typeof extra === 'string' || (typeof msg === 'object' && typeof msg.toString !== 'function')) {
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
      err = err || ErrorContext(msg)
      return err
    }
  })

  // Format the message
  let message = this.formatter(new Date(), level, data)

  if(typeof message==="string"){
    // Redact secrets
    for (const secret of [...this.secrets]) {
      message = message.replaceAll(
        secret,
        this.secretsHideCharsCount ? this.secretsStringSubstition : this.secretsRepeatCharSubstition.repeat(secret.length)
      )
    }
  
    // Prefix and Suffix
    message = `${this.prefix}${message}${this.suffix}`
    
    // Indentation
    message = `${" ".repeat(this.indentation)}${message}`
  }

  // Write out the message
  this._write(this.streams[i], message, 'utf8', done)
}

/**
 * Abstracted out the actuall writing of the log so it
 * can be eaisly overridden in sub-classes
 */
Logger.prototype._write = function (stream, msg, enc, done) {
  stream.write(msg, enc, done)
}

module.exports = new Logger()
module.exports.Logger = Logger

function ErrorContext (err, extra) {
  if (!(err instanceof Error)) {
    err = new Error(err)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, Logger.prototype.log)
    }
  }
  for (const key in extra) {
    err[key] = extra[key]
  }
  err.toJSON = function () {
    const o = {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
    for (const key in err) {
      if (key !== 'toJSON') {
        o[key] = err[key]
      }
    }
    return o
  }
  return err
}

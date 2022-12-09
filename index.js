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
    formatter = require(`${__dirname}/formatters/${formatter}`)
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
}

Logger.levels = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
]

// Add level constants
Logger.levels.forEach(function (level, i) {
  Logger[level.toUpperCase()] = i
})

/**
 * The default options
 *
 */
Logger.defaultOptions = {
  level: Logger.WARNING,
  formatter: require('./formatters/default'),
  streams: typeof window === 'undefined' ? Logger.levels.map(function (level, i) {
    return i > Logger.WARNING ? process.stdout : process.stderr
  }) : Logger.levels.map(function (level, i) {
    return i > Logger.WARNING ? {
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
  secretsStringSubstition: "***",
  secretsRepeatCharSubstition: "*"
}

Logger.prototype.child = function (fields = {}, options={}) {
  return new Logger({
    ...this.options,
    level: this.level,
    ...options,
    fields: {
      ...this.fields,
      ...fields
    },
  })
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

Logger.prototype.setLevel = function (level) {
  this.level = (typeof level === 'string') ? Logger.levels.indexOf(level) : level
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

  if(typeof msg === "object"){
    const tmpExtra = extra
    extra = msg
    msg = tmpExtra
  }

  // Extra is optional
  if (typeof extra === 'function') {
    done = extra
    extra = {}
  }
  const data = {
    ...(this.fields),
    ...(extra || {}),
  }

  // Set message on extra object
  const isErrorInstance = msg instanceof Error
  data.msg = isErrorInstance ? msg.message : msg
  data.code = msg.code || data.code
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
  
  // Redact secrets
  for (const secret of [...this.secrets]) {
    message = message.replaceAll(
      secret,
      this.secretsHideCharsCount ? this.secretsStringSubstition : this.secretsRepeatCharSubstition.repeat(secret.length)
    )
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

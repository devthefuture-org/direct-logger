const util = require("util")
const chalk = require('chalk')

const dayjs = require("../libs/dayjs")
const dayjsDurationToObject = require('../libs/dayjs-duration-to-object')
const lightDuration = require("../utils/light-duration")

const serializeError = require("../utils/serialize-error")

const escapeStringRe = /.*[\n\r"\s].*/
const escapeString = (s) => {
  if (typeof s !== "string" || escapeStringRe.test(s)) {
    s = JSON.stringify(s)
  }
  return s
}

const serializeMessage = (s) => {
  if (s instanceof Error) {
    return serializeError(s)
  }
  if (typeof s !== "string") {
    s = JSON.stringify(s, null, 2)
  }
  return s
}

module.exports = (loggerOptions = {}) => {
  const { formatterOptions, logger } = loggerOptions

  const colorByLevel = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'blue'
  }
  const opts = {
    colors: true,
    defaultColor: "white",
    levelColorByLevel: colorByLevel,
    msgColorByLevel: colorByLevel,
    errorLevels: [
      'error',
      'fatal'
    ],
    displayLevel: true,
    displayDate: false,
    displayDateFormat: `[yyyy-MM-dd HH:mm:ss]`,
    displayDuration: false,
    displayDurationStart: new Date(),
    displayDurationOptions: {},
    fieldsColor: "white",
    ...formatterOptions,
  }

  const {
    colors,
    displayLevel,
    displayDate,
    displayDateFormat,
    displayDuration,
    displayDurationStart,
    displayDurationOptions,
    fieldsColor,
    defaultColor,
    levelColorByLevel,
    msgColorByLevel,
    // errorLevels,
    separator = '\u3000', // Ideographic Space // see https://stackoverflow.com/a/65074578/5338073
    separatorReplacer = ' ',
  } = opts

  const escapeSeparator = (str)=>str.replaceAll(separator, separatorReplacer)

  const fieldsColorFunc = colors ? chalk[fieldsColor] || chalk[defaultColor] : (str)=>str

  return (date, level, data) => {
    let d = ""
    if(displayDate){
      d = dayjs(date).format(displayDateFormat)+" "
    }
    
    let duration = ""
    if(displayDuration){
      date.setMilliseconds(date.getMilliseconds() + 200)
      const diffDuration = dayjs.duration(dayjs(date).diff(displayDurationStart))
      const intervalDuration = dayjsDurationToObject(diffDuration)
      duration = lightDuration(intervalDuration, displayDurationOptions)
      duration = `[${duration}] `
    }
    
    let l = ""
    if(displayLevel){
      const levelColor = levelColorByLevel[level] || colorByLevel[level]
      const levelColorFunc = colors ? chalk[levelColor] || chalk[defaultColor] : (str)=>str
      l = levelColorFunc.underline('[' + level.toUpperCase() + ']') + ' '
    }

    const msgColor = msgColorByLevel[level] || colorByLevel[level]
    const msgColorFunc = colors ? chalk[msgColor] || chalk[defaultColor] : (str)=>str

    // hanlde multi-line messages
    let lines = serializeMessage(data.msg).split('\n')
    const firstLine = lines.shift()

    lines = [firstLine, ...lines].join('\n')
    lines = msgColorFunc(lines)

    let fieldsString = Object.keys(data).reduce((str, key) => {
      let value = data[key]
      if(value instanceof Error){
        value = serializeError(value)
      }
      if (value !== undefined && key !== 'msg') {
        if(typeof value === "function"){
          value = util.inspect(value)
        }
        str += `${separator}${escapeSeparator(escapeString(key))}=${escapeSeparator(escapeString(value))}`
      }
      return str
    }, '')
    fieldsString = fieldsColorFunc(fieldsString)

    let message = `${escapeSeparator(l+lines)}${fieldsString}\n`

    // Redact secrets
    for (const secret of [...logger.secrets]) {
      message = message.replaceAll(
        secret,
        logger.secretsHideCharsCount ? logger.secretsStringSubstition : logger.secretsRepeatCharSubstition.repeat(secret.length)
      )
    }
    
    // Indentation, Prefix, Suffix
    if(logger.prefixMultiline || logger.suffixMultiline || logger.indentMultiline){
      const lines = message.split('\n')
      const lastLineIndex = lines.length - 1
      message = lines.map((line, i) => {
        const prefix = (logger.prefixMultiline || i === 0) ? logger.prefix : ""
        const suffix = (logger.suffixMultiline || i === lastLineIndex) ? logger.suffix : ""
        let indentation = logger.indentMultiline || i === 0 ? logger.indentationString : ""
        if(!prefix){
          indentation = `${indentation}${logger.indentationPadding}`
        }
        return `${indentation}${prefix}${line}${suffix}`
      }).join('\n')
    } else {
      message = `${logger.indentationString}${logger.prefix}${message}${logger.suffix}`
    }

    if(logger.skipEmptyMsg && message.length === 0){
      return message
    }

    message = `${d}${duration}${message}`

    return message
  }
}

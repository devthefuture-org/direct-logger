const chalk = require('chalk')

const escapeStringRe = /.*[\n\r"\s].*/
const escapeString = (s) => {
  if (escapeStringRe.test(s)) {
    s = JSON.stringify(s)
  }
  return s
}

module.exports = (loggerOptions = {}) => {
  const { formatterOptions } = loggerOptions

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
      'warn',
      'error',
      'fatal'
    ],
    displayLevel: true,
    fieldsColor: "white",
    ...formatterOptions,
  }

  const {
    colors,
    displayLevel,
    fieldsColor,
    defaultColor,
    levelColorByLevel,
    msgColorByLevel,
    errorLevels,
  } = opts

  const fieldsColorFunc = colors ? chalk[fieldsColor] || chalk[defaultColor] : (str)=>str

  return (_date, level, data) => {
    let l = ""
    if(displayLevel){
      const levelColor = levelColorByLevel[level] || colorByLevel[level]
      const levelColorFunc = colors ? chalk[levelColor] || chalk[defaultColor] : (str)=>str
      l = levelColorFunc.underline('[' + level.toUpperCase() + ']') + ' '
    }
    const msgColor = msgColorByLevel[level] || colorByLevel[level]
    const msgColorFunc = colors ? chalk[msgColor] || chalk[defaultColor] : (str)=>str

    // hanlde multi-line messages
    let lines = data.msg.split('\n')
    const firstLine = lines.shift()

    // display stack trace for errors levels
    if (errorLevels.includes(level)) {
      // Remove multi-line message from stack
      const stack = data.err.stack.replace(data.msg, firstLine)
      lines = lines.concat(stack.split('\n'))
    }

    // dim and trim all but first line
    lines = lines.map((s) => s.trim())
    lines = [firstLine, ...lines].join('\n')
    lines = msgColorFunc(lines)

    let fieldsString = Object.keys(data).reduce((str, key) => {
      let value = data[key]
      if (value !== undefined && key !== 'msg' && key !== 'err') {
        if(typeof value === "function"){
          value = require("util").inspect(value)
        }
        str += ` ${escapeString(key)}=${escapeString(value)}`
      }
      return str
    }, '')
    fieldsString = fieldsColorFunc(fieldsString)

    return `${l}${lines}${fieldsString}\n`
  }
}

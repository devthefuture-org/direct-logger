const util = require('util')
const chalk = require('chalk')

module.exports = (options) => {
  const opts = Object.assign({
    colors: true,
    levels: {
      fatal: 'red',
      alert: 'red',
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      debug: 'cyan'
    },
    errorLevels: [
      'error',
      'fatal'
    ]
  }, options)

  if (opts.colors === false) {
    chalk.level = 0
  }

  return (date, level, data) => {
    const color = chalk[opts.levels[level]] || chalk.white

    // level formatting
    const l = color.underline(level) + (Array(Math.max(8 - level.length, 0)).join(' '))

    // hanlde multi-line messages
    let lines = data.msg.split('\n')
    const firstLine = lines.shift()

    // display stack trace for errors levels
    if (opts.errorLevels.includes(level)) {
      // Remove multi-line message from stack
      const stack = data.err.stack.replace(data.msg, firstLine)
      lines = lines.concat(stack.split('\n'))
    }

    // dim and trim all but first line
    lines = lines.map((s) => chalk.grey(s.trim()))
    lines = [firstLine, ...lines].join('\n')

    // format details
    const details = Object.keys(data).reduce((str, key) => {
      // dont display the message or error in details
      if (data[key] && key !== 'msg' && key !== 'err') {
        str += `\n  ${chalk.grey('-')} ${key}: ${util.inspect(data[key], { colors: opts.colors !== false })}`
      }
      return str
    }, '')

    return `${l} ${chalk.grey('›')} ${lines} ${details}\n`
  }
}

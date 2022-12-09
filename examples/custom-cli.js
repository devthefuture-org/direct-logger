
const Logger = require('../').Logger
const cli = require('../formatters/cli').create

const log = new Logger({
  formatter: cli({
    levels: {
      fatal: 'red',
      error: 'red',
      success: 'green',
      debug: 'cyan'
    },
    errorLevels: ['error', 'fatal']
  }),
  level: 'success',
  levels: [
    'fatal',
    'error',
    'success',
    'debug'
  ]
})

log.debug('Should not be printed')
log.success('Operation successful!')
log.error('An error occured', {
  extraError: 'information',
  provideError: 'context'
})
log.fatal('This is the end...')

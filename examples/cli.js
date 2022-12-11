const { Logger } = require('../')

const log = new Logger({
  formatter: 'cli-legacy',
  level: 'info',
  levels: [
    'emergency',
    'alert',
    'critical',
    'error',
    'warning',
    'notice',
    'info',
    'debug'
  ]
})
log.debug('Should not be printed')
log.info('Information unknown')
log.notice('Notice me plz')
log.error('An error occured')
log.critical('This is the song')
log.alert('That never ends')
log.emergency('It goes on and on')

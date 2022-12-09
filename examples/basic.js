
const log = require('../')

log.debug('Should not be printed')
log.info('Information not shown')
log.warning('You have been warned')
log.error('An error occured')
log.fatal('This is really the reall end.')

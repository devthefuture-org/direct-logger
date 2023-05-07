const dayjs = require('dayjs')
const toObject = require('dayjs/plugin/toObject')
const duration = require('dayjs/plugin/duration')

dayjs.extend(toObject)
dayjs.extend(duration)

module.exports = dayjs

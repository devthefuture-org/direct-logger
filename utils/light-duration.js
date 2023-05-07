// lighter than https://date-fns.org/v2.29.3/docs/formatISODuration

module.exports = (duration, options = {}) => {
  const {
    P = false,
    T = false,
    include = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'],
    always = ['seconds', 'milliseconds'],
    padding = true,
    paddingChar = '0',
    paddingYear = padding ? 4 : false,
    paddingMonth = padding ? 2 : false,
    paddingDays = padding ? 2 : false,
    paddingHours = padding ? 2 : false,
    paddingMinutes = padding ? 2 : false,
    paddingSeconds = padding ? 2 : false,
    paddingMilliSeconds = padding ? 3 : false,
    unitYear = 'Y',
    unitMonth = 'M',
    unitDay = 'D',
    unitHour = 'H',
    unitMinute = 'M',
    unitSecond = 'S',
    unitMilliSecond = 'ms'
  } = options

  let {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  } = duration
  let formattedDuration = ''
  if (P) {
    formattedDuration += 'P'
  }
  let unitPassed = false
  if (include.includes('years') && (years > 0 || always.includes('years'))) {
    if (paddingYear) {
      years = years.toString().padStart(paddingYear, paddingChar)
    }
    formattedDuration += `${years}${unitYear}`
    unitPassed = true
  }
  if (include.includes('months') && (months > 0 || unitPassed || always.includes('months'))) {
    if (paddingMonth) {
      months = months.toString().padStart(paddingMonth, paddingChar)
    }
    formattedDuration += `${months}${unitMonth}`
    unitPassed = true
  }
  if (T) {
    formattedDuration += 'T'
  }
  if (include.includes('days') && (days > 0 || unitPassed || always.includes('days'))) {
    if (paddingDays) {
      days = days.toString().padStart(paddingDays, paddingChar)
    }
    formattedDuration += `${days}${unitDay}`
    unitPassed = true
  }
  if (include.includes('hours') && (hours > 0 || unitPassed || always.includes('hours'))) {
    if (paddingHours) {
      hours = hours.toString().padStart(paddingHours, paddingChar)
    }
    formattedDuration += `${hours}${unitHour}`
    unitPassed = true
  }
  if (include.includes('minutes') && (minutes > 0 || unitPassed || always.includes('minutes'))) {
    if (paddingMinutes) {
      minutes = minutes.toString().padStart(paddingMinutes, paddingChar)
    }
    formattedDuration += `${minutes}${unitMinute}`
    unitPassed = true
  }
  if (include.includes('seconds') && (seconds > 0 || unitPassed || always.includes('seconds'))) {
    if (paddingSeconds) {
      seconds = seconds.toString().padStart(paddingSeconds, paddingChar)
    }
    formattedDuration += `${seconds}${unitSecond}`
  }
  if (include.includes('milliseconds') && (milliseconds > 0 || unitPassed || always.includes('milliseconds'))) {
    if (paddingMilliSeconds) {
      milliseconds = milliseconds.toString().padStart(paddingMilliSeconds, paddingChar)
    }
    formattedDuration += `${milliseconds}${unitMilliSecond}`
  }
  return formattedDuration
}

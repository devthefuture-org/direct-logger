const dayjs = require("./dayjs")
module.exports = (duration)=>{
  return {
    years: duration.years(),
    months: duration.months(),
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
    milliseconds: duration.milliseconds(),
  }
}
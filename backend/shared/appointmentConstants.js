const moment = require('moment')
const { DAY_MONTH_YEAR } = require('./dateHelpers')

const prepostDurations = {
  15: '15 minutes',
  30: '30 minutes',
  45: '45 minutes',
  60: '1 hour',
}

const validateDate = (date, errors) => {
  const now = moment()
  if (!date) errors.push({ text: 'Select a date', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR).isValid())
    errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })
}

const validateStartEndTime = (date, startTime, endTime, errors) => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTimeDuration = moment.duration(now.diff(startTime))
  const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

  if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

  if (isToday && startTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

  if (endTime && endTimeDuration.asMinutes() > 1) {
    errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
  }
}

module.exports = {
  validateDate,
  validateStartEndTime,
  prepostDurations,
}

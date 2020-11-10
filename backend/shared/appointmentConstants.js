const moment = require('moment')
const { DAY_MONTH_YEAR } = require('./dateHelpers')
const { calculateEndDate } = require('./RecurringAppointments')

const prepostDurations = {
  15: '15 minutes',
  30: '30 minutes',
  45: '45 minutes',
  60: '1 hour',
}

const endRecurringEndingDate = ({ date, startTime, times, repeats }) => {
  const recurringStartTime = (startTime && moment(startTime)) || moment(date, DAY_MONTH_YEAR).hours(0).minutes(0)

  const endOfPeriod = calculateEndDate({
    startTime: recurringStartTime,
    repeats,
    numberOfTimes: times,
  })

  return {
    endOfPeriod,
    recurringStartTime,
  }
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

const validateComments = (comments, errors) => {
  if (comments && comments.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })
}

module.exports = {
  endRecurringEndingDate,
  validateDate,
  validateStartEndTime,
  validateComments,
  prepostDurations,
}

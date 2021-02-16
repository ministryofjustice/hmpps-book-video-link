import moment from 'moment'
import { buildDate, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingPreCourt: {
    text: 'Select yes if you want to add a pre-court hearing briefing',
    href: '#pre-appointment-required',
  },
  missingPostCourt: {
    text: 'Select yes if you want to add a post-court hearing briefing',
    href: '#post-appointment-required',
  },
  endTime: {
    missingPart: { text: 'Select a full end time of the court hearing video link', href: '#end-time-hours' },
    missing: { text: 'Select the end time of the court hearing video link', href: '#end-time-hours' },
    past: { text: 'Select an end time that is not in the past', href: '#end-time-hours' },
    beforeStartTime: { text: 'Select an end time that is after the start time', href: '#end-time-hours' },
  },
  startTime: {
    missingPart: {
      text: 'Select a full start time of the court hearing video link',
      href: '#start-time-hours',
    },
    missing: { text: 'Select the start time of the court hearing video link', href: '#start-time-hours' },
    past: { text: 'Select a start time that is not in the past', href: '#start-time-hours' },
  },
  date: {
    missing: { text: 'Select the date of the video link', href: '#date' },
    invalid: {
      text:
        'Enter the date of the video link using numbers in the format of day, month and year separated using a forward slash. For example, 02/08/2020',
      href: '#date',
    },
    past: { text: 'Select a date that is not in the past', href: '#date' },
  },
}

const isValidNumber = number => Number.isSafeInteger(Number.parseInt(number, 10))

const validateTime = (date, startTimeHours, startTimeMinutes, endTimeHours, endTimeMinutes): ValidationError[] => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTime = buildDate(date, startTimeHours, startTimeMinutes)
  const endTime = buildDate(date, endTimeHours, endTimeMinutes)

  const errors: ValidationError[] = []
  if (!isValidNumber(startTimeHours) && !isValidNumber(startTimeMinutes)) {
    errors.push(errorTypes.startTime.missing)
  } else if (!isValidNumber(startTimeHours) || !isValidNumber(startTimeMinutes)) {
    errors.push(errorTypes.startTime.missingPart)
  }

  if (!isValidNumber(endTimeHours) && !isValidNumber(endTimeMinutes)) {
    errors.push(errorTypes.endTime.missing)
  } else if (!isValidNumber(endTimeHours) || !isValidNumber(endTimeMinutes)) {
    errors.push(errorTypes.endTime.missingPart)
  }

  const bookingDuration = endTime && startTime && moment.duration(endTime.diff(startTime)).asMinutes()
  const minutesBetweenNowAndStart = startTime && moment.duration(now.diff(startTime)).asMinutes()
  const minutesBetweenNowAndEnd = endTime && moment.duration(now.diff(endTime)).asMinutes()

  const isStartTimePast = isToday && minutesBetweenNowAndStart !== undefined && minutesBetweenNowAndStart > 0
  const isEndTimePast = isToday && minutesBetweenNowAndEnd !== undefined && minutesBetweenNowAndEnd > 0

  if (isStartTimePast) errors.push(errorTypes.startTime.past)
  if (isEndTimePast) errors.push(errorTypes.endTime.past)
  if (!isStartTimePast && !isEndTimePast && bookingDuration !== undefined && bookingDuration <= 0)
    errors.push(errorTypes.endTime.beforeStartTime)

  return errors
}

const validateDate = (date): ValidationError[] => {
  const errors = []
  const now = moment()
  if (!date) errors.push(errorTypes.date.missing)
  if (date && !moment(date, DAY_MONTH_YEAR, true).isValid()) errors.push(errorTypes.date.invalid)
  if (date && moment(date, DAY_MONTH_YEAR, true).isBefore(now, 'day')) errors.push(errorTypes.date.past)
  return errors
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  const {
    date,
    startTimeHours,
    startTimeMinutes,
    endTimeHours,
    endTimeMinutes,
    preAppointmentRequired,
    postAppointmentRequired,
  } = form

  const errors: ValidationError[] = []

  if (!preAppointmentRequired) errors.push(errorTypes.missingPreCourt)
  if (!postAppointmentRequired) errors.push(errorTypes.missingPostCourt)

  errors.push(...validateDate(date))
  errors.push(...validateTime(date, startTimeHours, startTimeMinutes, endTimeHours, endTimeMinutes))

  return errors
}

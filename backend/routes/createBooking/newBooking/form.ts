import moment, { Moment } from 'moment'
import { buildDate, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../../shared/dateHelpers'
import { assertHasStringValues, assertHasOptionalStringValues } from '../../../utils'

export type NewBooking = {
  courtId: string
  bookingId: number
  date: Moment
  startTime: Moment
  endTime: Moment
  preRequired: boolean
  postRequired: boolean
  preLocation?: number
  mainLocation: number
  postLocation?: number
}

export function NewBooking(form: unknown): NewBooking {
  assertHasStringValues(form, [
    'bookingId',
    'courtId',
    'date',
    'startTimeHours',
    'startTimeMinutes',
    'endTimeHours',
    'endTimeMinutes',
    'mainLocation',
    'preRequired',
    'postRequired',
  ])
  assertHasOptionalStringValues(form, ['preLocation', 'postLocation'])
  const preRequired = form.preRequired === 'true'
  const postRequired = form.postRequired === 'true'

  return {
    courtId: form.courtId,
    bookingId: Number(form.bookingId),
    date: moment(form.date, DAY_MONTH_YEAR),
    startTime: buildDate(form.date, form.startTimeHours, form.startTimeMinutes),
    endTime: buildDate(form.date, form.endTimeHours, form.endTimeMinutes),
    preRequired,
    postRequired,
    preLocation: preRequired ? parseInt(form.preLocation, 10) : null,
    mainLocation: parseInt(form.mainLocation, 10),
    postLocation: postRequired ? parseInt(form.postLocation, 10) : null,
  }
}

export type SelectAlternative = {
  startTime: Moment
  endTime: Moment
}

export function SelectAlternative(form: unknown): SelectAlternative {
  assertHasStringValues(form, ['startTime', 'endTime'])
  return {
    startTime: moment(form.startTime, DATE_TIME_FORMAT_SPEC),
    endTime: moment(form.endTime, DATE_TIME_FORMAT_SPEC),
  }
}

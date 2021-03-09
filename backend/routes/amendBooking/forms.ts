import moment, { Moment } from 'moment'
import { buildDate, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { assertHasStringValues, assertHasOptionalStringValues } from '../../utils'

export type ChangeDateAndTime = {
  agencyId: string
  date: Moment
  startTime: Moment
  endTime: Moment
  preRequired: boolean
  postRequired: boolean
}

export function ChangeDateAndTime(form: unknown): ChangeDateAndTime {
  assertHasStringValues(form, [
    'agencyId',
    'date',
    'startTimeHours',
    'startTimeMinutes',
    'endTimeHours',
    'endTimeMinutes',
    'preAppointmentRequired',
    'postAppointmentRequired',
  ])

  return {
    agencyId: form.agencyId,
    date: moment(form.date, DAY_MONTH_YEAR),
    startTime: buildDate(form.date, form.startTimeHours, form.startTimeMinutes),
    endTime: buildDate(form.date, form.endTimeHours, form.endTimeMinutes),
    preRequired: form.preAppointmentRequired === 'yes',
    postRequired: form.postAppointmentRequired === 'yes',
  }
}

export type RoomAndComment = {
  preLocation?: number
  mainLocation: number
  postLocation?: number
  comment: string
}

export function RoomAndComment(form: unknown): RoomAndComment {
  assertHasOptionalStringValues(form, ['preLocation', 'mainLocation', 'postLocation', 'comment'])

  return {
    preLocation: form.preLocation ? parseInt(form.preLocation, 10) : null,
    mainLocation: parseInt(form.mainLocation, 10),
    postLocation: form.postLocation ? parseInt(form.postLocation, 10) : null,
    comment: form.comment,
  }
}

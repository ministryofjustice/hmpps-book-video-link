import moment, { Moment } from 'moment'
import { buildDate, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { assertHasStringValues, assertHasOptionalStringValues, Codec } from '../../utils'

export type ChangeDateAndTime = {
  date: Moment
  startTime: Moment
  endTime: Moment
  preAppointmentRequired: boolean
  postAppointmentRequired: boolean
}

export function ChangeDateAndTime(form: unknown): ChangeDateAndTime {
  assertHasStringValues(form, [
    'date',
    'startTimeHours',
    'startTimeMinutes',
    'endTimeHours',
    'endTimeMinutes',
    'preAppointmentRequired',
    'postAppointmentRequired',
  ])

  return {
    date: moment(form.date, DAY_MONTH_YEAR),
    startTime: buildDate(form.date, form.startTimeHours, form.startTimeMinutes),
    endTime: buildDate(form.date, form.endTimeHours, form.endTimeMinutes),
    preAppointmentRequired: form.preAppointmentRequired === 'yes',
    postAppointmentRequired: form.postAppointmentRequired === 'yes',
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

export const ChangeDateAndTimeCodec: Codec<ChangeDateAndTime> = {
  write: (value: ChangeDateAndTime): Record<string, string> => {
    return {
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      startTime: value.startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: value.endTime.format(DATE_TIME_FORMAT_SPEC),
      preAppointmentRequired: value.preAppointmentRequired.toString(),
      postAppointmentRequired: value.postAppointmentRequired.toString(),
    }
  },

  read(record: Record<string, unknown>): ChangeDateAndTime {
    assertHasStringValues(record, ['date', 'startTime', 'endTime', 'preAppointmentRequired', 'postAppointmentRequired'])
    return {
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      startTime: moment(record.startTime, DATE_TIME_FORMAT_SPEC, true),
      endTime: moment(record.endTime, DATE_TIME_FORMAT_SPEC, true),
      preAppointmentRequired: record.preAppointmentRequired === 'true',
      postAppointmentRequired: record.postAppointmentRequired === 'true',
    }
  },
}

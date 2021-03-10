import { Request, Response } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasStringValues } from '../../utils'
import { clearState, Codec, getState, setState } from '../../utils/state'
import { ChangeDateAndTime } from './forms'

export type DateAndTime = ChangeDateAndTime
export type DateAndTimeAndCourt = DateAndTime & { court: string }

export const DateAndTimeCodec: Codec<DateAndTime> = {
  write: (value: ChangeDateAndTime): Record<string, string> => {
    return {
      bookingId: value.bookingId.toString(),
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      startTime: value.startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: value.endTime.format(DATE_TIME_FORMAT_SPEC),
      preRequired: value.preRequired.toString(),
      postRequired: value.postRequired.toString(),
    }
  },

  read(record: Record<string, unknown>): DateAndTime {
    assertHasStringValues(record, ['bookingId', 'date', 'startTime', 'endTime', 'preRequired', 'postRequired'])
    return {
      bookingId: Number(record.bookingId),
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      startTime: moment(record.startTime, DATE_TIME_FORMAT_SPEC, true),
      endTime: moment(record.endTime, DATE_TIME_FORMAT_SPEC, true),
      preRequired: record.preRequired === 'true',
      postRequired: record.postRequired === 'true',
    }
  },
}

export const DateAndTimeAndCourtCodec: Codec<DateAndTimeAndCourt> = {
  write: (value: DateAndTimeAndCourt): Record<string, string> => {
    return { ...DateAndTimeCodec.write(value), court: value.court }
  },

  read(record: Record<string, unknown>): DateAndTimeAndCourt {
    assertHasStringValues(record, ['court'])
    return { ...DateAndTimeCodec.read(record), court: record.court }
  },
}

export const clearNewBooking = clearState('booking-creation')

export const setNewBooking = <T>(res: Response, codec: Codec<T>, data: T): void =>
  setState('booking-creation', codec)(res, data)

export const getNewBooking = <T>(req: Request, codec: Codec<T>): T | undefined =>
  getState('booking-creation', codec)(req)

import { NextFunction, Request, RequestHandler, Response } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasOptionalStringValues, assertHasStringValues } from '../../utils'
import { clearState, Codec, getState, isStatePresent, setState } from '../../utils/state'
import { NewBooking } from './newBooking/form'

export const NewBookingCodec: Codec<NewBooking> = {
  write: (value: NewBooking): Record<string, string> => {
    return {
      courtId: value.courtId,
      bookingId: value.bookingId.toString(),
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      startTime: value.startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: value.endTime.format(DATE_TIME_FORMAT_SPEC),
      preRequired: value.preRequired.toString(),
      postRequired: value.postRequired.toString(),
      preLocation: value.preLocation?.toString(),
      mainLocation: value.mainLocation.toString(),
      postLocation: value.postLocation?.toString(),
    }
  },

  read(record: Record<string, unknown>): NewBooking {
    assertHasStringValues(record, [
      'courtId',
      'bookingId',
      'date',
      'startTime',
      'endTime',
      'preRequired',
      'postRequired',
      'mainLocation',
    ])
    assertHasOptionalStringValues(record, ['preLocation', 'postLocation'])

    const preRequired = record.preRequired === 'true'
    const postRequired = record.postRequired === 'true'

    return {
      courtId: record.courtId,
      bookingId: Number(record.bookingId),
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      startTime: moment(record.startTime, DATE_TIME_FORMAT_SPEC, true),
      endTime: moment(record.endTime, DATE_TIME_FORMAT_SPEC, true),
      preRequired,
      postRequired,
      preLocation: preRequired ? Number(record.preLocation) : undefined,
      mainLocation: Number(record.mainLocation),
      postLocation: postRequired ? Number(record.postLocation) : undefined,
    }
  },
}

const COOKIE_NAME = 'booking-creation'

export const clearNewBooking = clearState(COOKIE_NAME)

export const setNewBooking = (res: Response, data: NewBooking): void =>
  setState(COOKIE_NAME, NewBookingCodec)(res, data)

export const getNewBooking = (req: Request): NewBooking | undefined => getState(COOKIE_NAME, NewBookingCodec)(req)

export const ensureNewBookingPresentMiddleware =
  (redirectUrl: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return isStatePresent(COOKIE_NAME)(req) ? next() : res.redirect(redirectUrl)
  }

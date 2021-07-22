import { NextFunction, Request, RequestHandler, Response } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasOptionalStringValues, assertHasStringValues } from '../../utils'
import { clearState, Codec, getState, setState, isStatePresent } from '../../utils/state'
import { ChangeVideoLinkBooking } from './forms'

export const ChangeVideoLinkBookingCodec: Codec<ChangeVideoLinkBooking> = {
  write: (value: ChangeVideoLinkBooking): Record<string, string> => {
    return {
      agencyId: value.agencyId,
      courtId: value.courtId,
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      startTime: value.startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: value.endTime.format(DATE_TIME_FORMAT_SPEC),
      mainLocation: value.mainLocation.toString(),
      preLocation: value.preLocation ? value.preLocation.toString() : null,
      postLocation: value.postLocation ? value.postLocation.toString() : null,
      preRequired: value.preRequired.toString(),
      postRequired: value.postRequired.toString(),
    }
  },

  read(record: Record<string, unknown>): ChangeVideoLinkBooking {
    assertHasStringValues(record, [
      'agencyId',
      'courtId',
      'date',
      'startTime',
      'endTime',
      'mainLocation',
      'preRequired',
      'postRequired',
    ])
    assertHasOptionalStringValues(record, ['preLocation', 'postLocation'])

    const preRequired = record.preRequired === 'true'
    const postRequired = record.postRequired === 'true'

    return {
      agencyId: record.agencyId,
      courtId: record.courtId,
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      startTime: moment(record.startTime, DATE_TIME_FORMAT_SPEC, true),
      endTime: moment(record.endTime, DATE_TIME_FORMAT_SPEC, true),
      preRequired,
      postRequired,
      preLocation: preRequired ? Number(record.preLocation) : null,
      mainLocation: Number(record.mainLocation),
      postLocation: postRequired ? Number(record.postLocation) : null,
    }
  },
}

const COOKIE_NAME = 'booking-update'

export const clearUpdate = clearState(COOKIE_NAME)

export const setUpdate = (res: Response, data: ChangeVideoLinkBooking): void =>
  setState(COOKIE_NAME, ChangeVideoLinkBookingCodec)(res, data)

export const getUpdate = (req: Request): ChangeVideoLinkBooking | undefined =>
  getState(COOKIE_NAME, ChangeVideoLinkBookingCodec)(req)

export const ensureUpdatePresentMiddleware =
  (redirectUrl: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return isStatePresent(COOKIE_NAME)(req) ? next() : res.redirect(redirectUrl + req.params.bookingId)
  }

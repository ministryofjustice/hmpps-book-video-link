import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasOptionalStringValues, assertHasStringValues } from '../../utils'
import { clearState, Codec, getState, setState } from '../../utils/state'
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

export const clearUpdate = clearState('booking-update')
export const setUpdate = setState('booking-update', ChangeVideoLinkBookingCodec)
export const getUpdate = getState('booking-update', ChangeVideoLinkBookingCodec)

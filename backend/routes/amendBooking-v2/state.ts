import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasStringValues } from '../../utils'
import { clearState, Codec, getState, setState } from '../../utils/state'
import { ChangeDateAndTime } from './forms'

export const ChangeDateAndTimeCodec: Codec<ChangeDateAndTime> = {
  write: (value: ChangeDateAndTime): Record<string, string> => {
    return {
      agencyId: value.agencyId,
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      startTime: value.startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: value.endTime.format(DATE_TIME_FORMAT_SPEC),
      preRequired: value.preRequired.toString(),
      postRequired: value.postRequired.toString(),
    }
  },

  read(record: Record<string, unknown>): ChangeDateAndTime {
    assertHasStringValues(record, ['agencyId', 'date', 'startTime', 'endTime', 'preRequired', 'postRequired'])
    return {
      agencyId: record.agencyId,
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      startTime: moment(record.startTime, DATE_TIME_FORMAT_SPEC, true),
      endTime: moment(record.endTime, DATE_TIME_FORMAT_SPEC, true),
      preRequired: record.preRequired === 'true',
      postRequired: record.postRequired === 'true',
    }
  },
}

export const clearUpdate = clearState('booking-update')
export const setUpdate = setState('booking-update', ChangeDateAndTimeCodec)
export const getUpdate = getState('booking-update', ChangeDateAndTimeCodec)

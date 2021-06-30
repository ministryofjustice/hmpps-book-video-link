import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { ChangeVideoLinkBookingCodec } from './state'

describe('ChangeVideoLinkBookingCodec', () => {
  test('read', () => {
    const result = ChangeVideoLinkBookingCodec.read({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })

  test('write', () => {
    const result = ChangeVideoLinkBookingCodec.write({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

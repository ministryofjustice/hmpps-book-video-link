import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { ChangeVideoLinkBookingCodec } from './state'

describe('ChangeVideoLinkBookingCodec', () => {
  test('read optional', () => {
    const result = ChangeVideoLinkBookingCodec.read({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      mainLocation: '1',
      preLocation: '2',
      postLocation: '3',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      mainLocation: 1,
      preLocation: 2,
      postLocation: 3,
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })
  test('read mandatory', () => {
    const result = ChangeVideoLinkBookingCodec.read({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      mainLocation: '1',
      preRequired: 'false',
      postRequired: 'false',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      mainLocation: 1,
      preLocation: null,
      postLocation: null,
      postRequired: false,
      preRequired: false,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })

  test('write optional', () => {
    const result = ChangeVideoLinkBookingCodec.write({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: false,
      preRequired: false,
      mainLocation: 1,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      mainLocation: '1',
      preLocation: null,
      postLocation: null,
      preRequired: 'false',
      postRequired: 'false',
    })
  })

  test('write mandatory', () => {
    const result = ChangeVideoLinkBookingCodec.write({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      mainLocation: 1,
      preLocation: 2,
      postLocation: 3,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      mainLocation: '1',
      preLocation: '2',
      postLocation: '3',
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

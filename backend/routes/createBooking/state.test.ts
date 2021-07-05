import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockNext, mockRequest, mockResponse } from '../__test/requestTestUtils'
import { NewBookingCodec, ensureNewBookingPresentMiddleware } from './state'

describe('NewBookingCodec', () => {
  test('read optional', () => {
    const result = NewBookingCodec.read({
      courtId: 'COURT-1',
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
      preLocation: '1',
      postLocation: '2',
      mainLocation: '3',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      courtId: 'COURT-1',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      mainLocation: 3,
      postLocation: 2,
      preLocation: 1,
    })
  })

  test('read mandatory', () => {
    const result = NewBookingCodec.read({
      courtId: 'COURT-1',
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'false',
      postRequired: 'false',
      mainLocation: '3',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      courtId: 'COURT-1',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: false,
      preRequired: false,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      mainLocation: 3,
      postLocation: undefined,
      preLocation: undefined,
    })
  })

  test('write optional', () => {
    const result = NewBookingCodec.write({
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: false,
      preRequired: false,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      courtId: 'COURT-1',
      mainLocation: 3,
    })

    expect(result).toStrictEqual({
      bookingId: '123456',
      courtId: 'COURT-1',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'false',
      postRequired: 'false',
      mainLocation: '3',
      postLocation: undefined,
      preLocation: undefined,
    })
  })

  test('write mandatory', () => {
    const result = NewBookingCodec.write({
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      courtId: 'COURT-1',
      preLocation: 1,
      postLocation: 2,
      mainLocation: 3,
    })

    expect(result).toStrictEqual({
      bookingId: '123456',
      courtId: 'COURT-1',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
      mainLocation: '3',
      postLocation: '2',
      preLocation: '1',
    })
  })
})

describe('ensureNewBookingPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'booking-creation': 'some content' }

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'booking-creation': '' }

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})

import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockNext, mockRequest, mockResponse } from '../__test/requestTestUtils'
import { DateAndTimeAndCourtCodec, DateAndTimeCodec, ensureNewBookingPresentMiddleware } from './state'

describe('DateAndTimeCodec', () => {
  test('read', () => {
    const result = DateAndTimeCodec.read({
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })

  test('write', () => {
    const result = DateAndTimeCodec.write({
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

describe('DateAndTimeAndCourtCodec', () => {
  test('read', () => {
    const result = DateAndTimeAndCourtCodec.read({
      court: 'London',
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      court: 'London',
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })

  test('write', () => {
    const result = DateAndTimeAndCourtCodec.write({
      court: 'London',
      bookingId: 123456,
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      court: 'London',
      bookingId: '123456',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

describe('ensureNewBookingPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse()
    const next = mockNext()

    req.signedCookies = { 'booking-creation': 'some content' }

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse()
    const next = mockNext()

    req.signedCookies = { 'booking-creation': '' }

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse()
    const next = mockNext()

    req.signedCookies = {}

    ensureNewBookingPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})

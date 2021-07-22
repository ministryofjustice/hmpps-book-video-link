import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockNext, mockRequest, mockResponse } from '../__test/requestTestUtils'
import { ChangeVideoLinkBookingCodec, ensureUpdatePresentMiddleware } from './state'

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

describe('ensureUpdatePresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({ params: { bookingId: '123' } })
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'booking-update': 'some content' }

    ensureUpdatePresentMiddleware('/redirect/')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({ params: { bookingId: '123' } })
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'booking-update': '' }

    ensureUpdatePresentMiddleware('/redirect/')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect/123')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({ params: { bookingId: '123' } })
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    ensureUpdatePresentMiddleware('/redirect/')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect/123')
    expect(next).not.toHaveBeenCalled()
  })
})

import moment from 'moment'

import AvailabilityCheckService from '../services/availabilityCheckService'
import checkAvailability from './checkAvailability'
import { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'
import { Room } from '../services/model'
import { Services } from '../services'
import { mockRequest, mockResponse } from '../routes/__test/requestTestUtils'

jest.mock('../services/availabilityCheckService')

const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

const req = mockRequest({
  params: {
    offenderNo: 'A12345',
    agencyId: 'MDI',
  },
})

const res = mockResponse()
const next = jest.fn()

describe('check availability middleware', () => {
  let middleware

  beforeEach(() => {
    jest.resetAllMocks()
    middleware = checkAvailability(({ availabilityCheckService } as unknown) as Services)
    req.signedCookies = {
      'booking-creation': {
        bookingId: '123456',
        date: '2017-01-01T00:00:00',
        postRequired: 'true',
        preRequired: 'true',
        endTime: '2017-01-01T13:00:00',
        startTime: '2017-01-01T12:00:00',
      },
    }
  })
  const room = (value): Room => ({ value, text: `Room ${value}` })

  describe('when there are no rooms available', () => {
    it('should render no room available page', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: false,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      availabilityCheckService.isStillAvailable.mockReturnValue(true)
      req.body = {}

      await middleware(req, res, next)

      expect(res.render).toHaveBeenCalledWith('createBooking/noAvailabilityForDateTime.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        endTime: '14:00',
        date: 'Sunday 1 January 2017',
        startTime: '13:30',
      })
    })
  })

  describe('when there are rooms available', () => {
    it('should place appointment details into flash and continue to next middleware', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      availabilityCheckService.isStillAvailable.mockReturnValue(true)
      req.body = {}

      await middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should call getAvailability with correct args', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {}

      await middleware(req, res, next)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(res.locals, {
        bookingId: 123456,
        agencyId: 'MDI',
        date: moment('2017-01-01T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2017-01-01T13:00:00', DATE_TIME_FORMAT_SPEC, true),
        postRequired: true,
        preRequired: true,
        startTime: moment('2017-01-01T12:00:00', DATE_TIME_FORMAT_SPEC, true),
      })
    })
  })

  describe('when selected rooms are no longer available', () => {
    it('should render no rooms are available page when no selected are available', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [room(1)], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      availabilityCheckService.isStillAvailable.mockReturnValue(false)

      req.body = {
        preLocation: '45',
        mainLocation: '72',
        postLocation: '93',
      }

      await middleware(req, res, next)

      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })
  })
})

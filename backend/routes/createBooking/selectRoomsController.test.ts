import moment from 'moment'

import SelectRoomsController from './selectRoomsController'
import config from '../../config'
import BookingService from '../../services/bookingService'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { RoomAvailability } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockNext, mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../api/prisonApi')
jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('Select court appointment rooms', () => {
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  let controller: SelectRoomsController

  const req = mockRequest({ params: { agencyId: 'WWI', offenderNo: 'A12345' } })
  const res = mockResponse()
  const next = mockNext()

  const availableLocations: RoomAvailability = {
    isAvailable: true,
    totalInterval: { start: '09:00', end: '10:00' },
    rooms: {
      main: [{ value: 1, text: 'Room 1' }],
      pre: [{ value: 2, text: 'Room 2' }],
      post: [{ value: 3, text: 'Room 3' }],
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()

    req.flash.mockReturnValue([])

    bookingService.create.mockResolvedValue(123)

    availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)

    controller = new SelectRoomsController(bookingService, availabilityCheckService)

    req.signedCookies = {
      'booking-creation': {
        court: 'Leeds',
        bookingId: '123456',
        date: '2017-11-10T00:00:00',
        postRequired: 'true',
        preRequired: 'true',
        endTime: '2017-11-10T14:00:00',
        startTime: '2017-11-10T11:00:00',
      },
    }
  })

  describe('view', () => {
    it('should return locations', async () => {
      const { view } = controller

      await view(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          mainLocations: [{ text: 'Room 1', value: 1 }],
          postLocations: [{ text: 'Room 3', value: 3 }],
          preLocations: [{ text: 'Room 2', value: 2 }],
        })
      )
    })

    it('should call getAvailability with the correct parameters', async () => {
      const { view } = controller

      await view(req, res, next)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(res.locals, {
        bookingId: 123456,
        court: 'Leeds',
        agencyId: 'WWI',
        date: moment('2017-11-10T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
        postRequired: true,
        preRequired: true,
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      res.redirect = jest.fn()
      config.notifications.emails.WWI.omu = 'omu@prison.com'
      config.notifications.emails.WWI.vlb = 'vlb@prison.com'
    })

    it('should redirect back when errors in request', async () => {
      const { submit } = controller

      const reqWithErrors = mockRequest({
        params: { agencyId: 'WWI', offenderNo: 'A12345' },
        body: {
          preLocation: '1',
          mainLocation: '2',
          postLocation: '3',
          comment: 'Test',
        },
        errors: [{ href: '#preLocation' }],
      })

      await submit(reqWithErrors, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/WWI/offenders/A12345/add-court-appointment/select-rooms')
      expect(bookingService.create).not.toHaveBeenCalled()
    })

    it('should redirect to confirmation page', async () => {
      const { submit } = controller

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      await submit(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    it('should redirect to confirmation page if no pre or post rooms are required', async () => {
      const { submit } = controller

      req.body = {
        mainLocation: '2',
        comment: 'Test',
      }

      await submit(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    describe('should call the booking service with correct details', () => {
      it('with all fields ', async () => {
        const { submit } = controller

        req.body = {
          preLocation: '1',
          mainLocation: '2',
          postLocation: '3',
          comment: 'Test',
        }

        await submit(req, res, next)

        expect(bookingService.create).toBeCalledWith(res.locals, 'COURT_USER', {
          agencyId: 'WWI',
          court: 'Leeds',
          comment: 'Test',
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          offenderNo: 'A12345',
          pre: 1,
          main: 2,
          post: 3,
        })
      })

      it('with only mandatory fields ', async () => {
        const { submit } = controller

        req.body = {
          mainLocation: '2',
        }

        await submit(req, res, next)

        expect(bookingService.create).toBeCalledWith(res.locals, 'COURT_USER', {
          agencyId: 'WWI',
          court: 'Leeds',
          comment: null,
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          offenderNo: 'A12345',
          pre: null,
          main: 2,
          post: null,
        })
      })
    })

    it('cookie is cleared on successful submit ', async () => {
      const { submit } = controller

      req.body = {
        mainLocation: '2',
      }

      await submit(req, res, next)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-creation', expect.any(Object))
    })
  })
})

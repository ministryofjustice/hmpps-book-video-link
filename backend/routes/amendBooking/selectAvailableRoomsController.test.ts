import moment from 'moment'

import SelectAvailableRoomsController from './selectAvailableRoomsController'
import BookingService from '../../services/bookingService'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { BookingDetails, RoomAvailability } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('Select available rooms controller', () => {
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  let controller: SelectAvailableRoomsController

  const req = mockRequest({ params: { bookingId: '12' } })
  const res = mockResponse()

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    dateDescription: '20 November 2020',
    date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
    offenderNo: 'A123AA',
    prisonerName: 'John Doe',
    prisonName: 'some prison',
    prisonBookingId: 1,
    comments: 'some comment',
    preDetails: {
      prisonRoom: 'vcc room 2',
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 2 - 17:40 to 18:00',
    },
    mainDetails: {
      prisonRoom: 'vcc room 1',
      startTime: '18:00',
      endTime: '19:00',
      description: 'vcc room 1 - 18:00 to 19:00',
    },
    postDetails: {
      prisonRoom: 'vcc room 3',
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 3 - 19:00 to 19:20',
    },
  }

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
    controller = new SelectAvailableRoomsController(bookingService, availabilityCheckService)

    req.signedCookies = {
      'booking-update': {
        agencyId: 'WWI',
        date: '2020-11-20T00:00:00',
        startTime: '2020-11-20T18:00:00',
        endTime: '2020-11-20T19:00:00',
        preRequired: 'true',
        postRequired: 'true',
      },
    }
  })

  describe('view', () => {
    const mockFlashState = ({ errors, input }) => req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(input)

    it('should redirect when no stored state', async () => {
      mockFlashState({ errors: [], input: [] })
      req.signedCookies = {}

      await controller.view()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/booking-details/12')
    })

    describe('View page with no errors', () => {
      it('should display booking details', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
        mockFlashState({ errors: [], input: [] })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/selectAvailableRooms.njk', {
          bookingId: '12',
          preAppointmentRequired: true,
          postAppointmentRequired: true,
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
          form: {
            comment: 'some comment',
          },
          errors: [],
        })
      })

      it('should call the existingEventsService with correct video link booking details', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
        mockFlashState({ errors: [], input: [] })

        await controller.view()(req, res, null)

        expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(res.locals, {
          agencyId: 'WWI',
          videoBookingId: 12,
          date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
          startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
          endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
          postRequired: true,
          preRequired: true,
        })
      })
    })

    describe('View page with errors present', () => {
      it('should display validation for errors', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [
            {
              preLocation: '2',
              mainLocation: '1',
              postLocation: '3',
              comment: 'another comment',
            },
          ],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/selectAvailableRooms.njk', {
          bookingId: '12',
          preAppointmentRequired: true,
          postAppointmentRequired: true,
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
          form: {
            preLocation: 2,
            mainLocation: 1,
            postLocation: 3,
            comment: 'another comment',
          },
          errors: [{ text: 'error message', href: 'error' }],
        })
      })

      it('When there is no user input', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/selectAvailableRooms.njk', {
          bookingId: '12',
          preAppointmentRequired: true,
          postAppointmentRequired: true,
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
          form: {
            comment: 'some comment',
          },
          errors: [{ text: 'error message', href: 'error' }],
        })
      })
    })
  })

  describe('submit', () => {
    it('should redirect to booking details confirmation page when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-change-confirmed/12`)
    })

    it('Redirect when room is no longer available', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('NO_LONGER_AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/room-no-longer-available/12`)
    })

    it('Redirect when no longer any availability for date/time', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('NOT_AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-not-available/12`)
    })

    it('should submit perform an update', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      req.body = { preLocation: '9', mainLocation: '10', postLocation: '11', comment: 'A comment' }

      await controller.submit()(req, res, null)

      expect(bookingService.update).toHaveBeenCalledWith(res.locals, 'COURT_USER', 12, {
        comment: 'A comment',
        agencyId: 'WWI',
        date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        preLocation: 9,
        mainLocation: 10,
        postLocation: 11,
        preRequired: true,
        postRequired: true,
      })
    })

    it('should submit perform an update with optional fields', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      req.signedCookies = {
        'booking-update': {
          agencyId: 'WWI',
          date: '2020-11-20T00:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preRequired: 'false',
          postRequired: 'false',
        },
      }
      req.body = { mainLocation: '10' }

      await controller.submit()(req, res, null)

      expect(bookingService.update).toHaveBeenCalledWith(res.locals, 'COURT_USER', 12, {
        comment: undefined,
        agencyId: 'WWI',
        date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        preLocation: null,
        mainLocation: 10,
        postLocation: null,
        preRequired: false,
        postRequired: false,
      })
    })

    it('should clear cookie when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-update', expect.anything())
    })

    describe('when errors are present', () => {
      beforeEach(() => {
        req.errors = [{ text: 'error message', href: 'error' }]
      })

      it('should place errors into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should place input into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('input', req.body)
      })

      it('should redirect to same page', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/select-available-rooms/12`)
      })
    })
  })
})

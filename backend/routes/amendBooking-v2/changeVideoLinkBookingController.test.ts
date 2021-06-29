import moment from 'moment'
import ChangeVideoLinkBookingController from './changeVideoLinkBookingController'
import BookingService from '../../services/bookingService'
import LocationService from '../../services/locationService'
import { BookingDetails, RoomAvailability } from '../../services/model'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')
jest.mock('../../services/locationService')

describe('change video link booking controller', () => {
  const bookingService = new BookingService(null, null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: ChangeVideoLinkBookingController
  const req = mockRequest({
    params: { bookingId: '123' },
    body: {
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '20/11/2020',
      startTimeHours: '17',
      startTimeMinutes: '40',
      endTimeHours: '19',
      endTimeMinutes: '20',
      preAppointmentRequired: 'yes',
      postAppointmentRequired: 'yes',
    },
  })

  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    courtId: 'CLDN',
    dateDescription: '20 November 2020',
    date: moment('2020-11-20T18:00:00', 'YYYY-MM-DDTHH:mm:ss'),
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
      startTime: '19:00',
      endTime: '19:20',
      description: 'vcc room 3 - 19:00 to 19:20',
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new ChangeVideoLinkBookingController(bookingService, availabilityCheckService, locationService)
    locationService.getVideoLinkEnabledCourts.mockResolvedValue([
      { text: 'Westminster Crown Court', value: 'WMRCN' },
      { text: 'Wimbledon County Court', value: 'WLDCOU' },
      { text: 'City of London', value: 'CLDN' },
    ])
  })

  describe('start', () => {
    it('Clear cookie and redirects', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      await controller.start()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-update', expect.anything())

      expect(res.redirect).toHaveBeenCalledWith('/change-video-link-date-and-time/123')
    })
  })

  describe('view', () => {
    const mockFlashState = ({ errors, input }) => req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(input)

    it('View page with no errors', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      mockFlashState({ errors: [], input: [] })

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking-v2/changeVideoLinkBooking.njk', {
        bookingId: '123',
        agencyId: 'WWI',
        courts: [
          { text: 'Westminster Crown Court', value: 'WMRCN' },
          { text: 'Wimbledon County Court', value: 'WLDCOU' },
          { text: 'City of London', value: 'CLDN' },
        ],
        locations: { prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        errors: [],
        form: {
          date: '20/11/2020',
          courtId: 'CLDN',
          startTimeHours: '18',
          startTimeMinutes: '00',
          endTimeHours: '19',
          endTimeMinutes: '00',
          mainLocation: 'vcc room 1',
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
        },
      })
    })

    it('View page with errors present', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      mockFlashState({
        errors: [{ text: 'error message', href: 'error' }],
        input: [
          {
            date: '21/11/2020',
            startTimeHours: '11',
            startTimeMinutes: '20',
            endTimeHours: '11',
            endTimeMinutes: '40',
            postAppointmentRequired: 'yes',
            preAppointmentRequired: 'yes',
          },
        ],
      })

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking-v2/changeVideoLinkBooking.njk', {
        bookingId: '123',
        agencyId: 'WWI',
        courts: [
          { text: 'Westminster Crown Court', value: 'WMRCN' },
          { text: 'Wimbledon County Court', value: 'WLDCOU' },
          { text: 'City of London', value: 'CLDN' },
        ],
        locations: { prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        errors: [{ text: 'error message', href: 'error' }],
        form: {
          date: '21/11/2020',
          startTimeHours: '11',
          startTimeMinutes: '20',
          endTimeHours: '11',
          endTimeMinutes: '40',
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
        },
      })
    })

    it('When there is no user input', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      mockFlashState({
        errors: [{ text: 'error message', href: 'error' }],
        input: [],
      })

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking-v2/changeVideoLinkBooking.njk', {
        bookingId: '123',
        agencyId: 'WWI',
        courts: [
          { text: 'Westminster Crown Court', value: 'WMRCN' },
          { text: 'Wimbledon County Court', value: 'WLDCOU' },
          { text: 'City of London', value: 'CLDN' },
        ],
        locations: { prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        errors: [{ text: 'error message', href: 'error' }],
        form: {
          date: '20/11/2020',
          courtId: 'CLDN',
          startTimeHours: '18',
          startTimeMinutes: '00',
          endTimeHours: '19',
          endTimeMinutes: '00',
          mainLocation: 'vcc room 1',
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
        },
      })
    })
  })

  describe('submit', () => {
    it('should redirect to the available page on submit when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      const availability: RoomAvailability = {
        isAvailable: true,
        rooms: null,
        totalInterval: null,
      }
      availabilityCheckService.getAvailability.mockResolvedValue(availability)
      req.params.bookingId = '12'

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-available/12`)
    })

    it("should redirect to '/video-link-not-available' when no availability for selected date/time", async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      const availability: RoomAvailability = {
        isAvailable: false,
        rooms: null,
        totalInterval: null,
      }
      availabilityCheckService.getAvailability.mockResolvedValue(availability)
      req.params.bookingId = '12'

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-not-available/12`)
    })

    it('should set state in cookie', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      const availability: RoomAvailability = {
        isAvailable: false,
        rooms: null,
        totalInterval: null,
      }
      availabilityCheckService.getAvailability.mockResolvedValue(availability)
      req.params.bookingId = '12'

      await controller.submit()(req, res, null)

      expect(res.cookie).toHaveBeenCalledWith(
        'booking-update',
        {
          agencyId: 'WWI',
          courtId: 'CLDN',
          date: '2020-11-20T00:00:00',
          endTime: '2020-11-20T19:20:00',
          postRequired: 'true',
          preRequired: 'true',
          startTime: '2020-11-20T17:40:00',
        },
        expect.anything()
      )
    })

    describe('when errors are present', () => {
      beforeEach(() => {
        req.errors = [{ text: 'error message', href: 'error' }]
        req.params.bookingId = '12'
      })

      it('should place errors into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should place input into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        req.body = { date: 'blah' }

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('input', [req.body])
      })

      it('should redirect to same page', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/change-video-link-date-and-time/12`)
      })
    })
  })
})

import { Request, Response } from 'express'
import moment from 'moment'
import ChangeDateAndTimeController from './changeDateAndTimeController'
import BookingService from '../../services/bookingService'
import { BookingDetails, RoomAvailability } from '../../services/model'
import AvailabilityCheckService from '../../services/availabilityCheckService'

jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('change date and time controller', () => {
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

  let controller: ChangeDateAndTimeController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'WWI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { name: 'Bob Smith', username: 'BOB_SMITH' } },
    query: {},
    body: {
      agencyId: 'WWI',
      date: '20/11/2020',
      startTimeHours: '17',
      startTimeMinutes: '40',
      endTimeHours: '19',
      endTimeMinutes: '20',
      preAppointmentRequired: 'yes',
      postAppointmentRequired: 'yes',
    },
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
    clearCookie: jest.fn(),
    cookie: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
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
    controller = new ChangeDateAndTimeController(bookingService, availabilityCheckService)
  })

  describe('start', () => {
    it('Clear cookie and redirects when changing date and time', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      await controller.start()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-update', expect.anything())

      expect(res.redirect).toHaveBeenCalledWith('/change-date-and-time/123')
    })

    it('Clears cookie and redirects when changing time only', async () => {
      req.query.changeTime = 'true'

      await controller.start()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-update', expect.anything())

      expect(res.redirect).toHaveBeenCalledWith('/change-time/123')
    })
  })

  describe('view', () => {
    const mockFlashState = ({ errors, input }) =>
      (req.flash as any).mockReturnValueOnce(errors).mockReturnValueOnce(input)

    describe('View page with no errors', () => {
      it('When changing date and time', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({ errors: [], input: [] })

        await controller.view(false)(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
          bookingId: 123,
          agencyId: 'WWI',
          changeTime: false,
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          errors: [],
          form: {
            date: null,
          },
        })
      })

      it('When changing time only', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({ errors: [], input: [] })

        await controller.view(true)(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
          bookingId: 123,
          agencyId: 'WWI',
          changeTime: true,
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          errors: [],
          form: {
            date: '20/11/2020',
          },
        })
      })
    })

    describe('View page with errors present', () => {
      it('When changing date and time', async () => {
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

        await controller.view(false)(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
          bookingId: 123,
          agencyId: 'WWI',
          changeTime: false,
          locations: { court: 'City of London', prison: 'some prison' },
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

      it('When changing time only', async () => {
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

        await controller.view(true)(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
          bookingId: 123,
          agencyId: 'WWI',
          changeTime: true,
          errors: [{ text: 'error message', href: 'error' }],
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
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
    })

    it('When there is no user input and change date and time', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      mockFlashState({
        errors: [{ text: 'error message', href: 'error' }],
        input: [],
      })

      await controller.view(false)(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
        bookingId: 123,
        agencyId: 'WWI',
        changeTime: false,
        locations: { court: 'City of London', prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        errors: [{ text: 'error message', href: 'error' }],
        form: {
          date: null,
        },
      })
    })

    it('When there is no user input and change time only', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      mockFlashState({
        errors: [{ text: 'error message', href: 'error' }],
        input: [],
      })

      await controller.view(true)(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
        bookingId: 123,
        agencyId: 'WWI',
        changeTime: true,
        errors: [{ text: 'error message', href: 'error' }],
        locations: { court: 'City of London', prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        form: {
          date: '20/11/2020',
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

      await controller.submit(false)(req, res, null)

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

      await controller.submit(false)(req, res, null)

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

      await controller.submit(false)(req, res, null)

      expect(res.cookie).toHaveBeenCalledWith(
        'booking-update',
        {
          agencyId: 'WWI',
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

        await controller.submit(false)(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should place input into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        req.body = { date: 'blah' }

        await controller.submit(false)(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('input', [req.body])
      })

      it('should redirect to same page when changing date and time', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit(false)(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/change-date-and-time/12`)
      })

      it('should redirect to same page when changing time only', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit(true)(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/change-time/12`)
      })
    })
  })
})

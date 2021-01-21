import { Request, Response } from 'express'
import moment from 'moment'
import ChangeDateAndTimeController from './changeDateAndTimeController'
import BookingService from '../../services/bookingService'
import { BookingDetails } from '../../services/model'

jest.mock('../../services/bookingService')

describe('change date and time controller', () => {
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  let controller: ChangeDateAndTimeController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
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
      timings: '17:40 to 18:00',
    },
    mainDetails: {
      prisonRoom: 'vcc room 1',
      startTime: '18:00',
      endTime: '19:00',
      description: 'vcc room 1 - 18:00 to 19:00',
      timings: '18:00 to 19:00',
    },
    postDetails: {
      prisonRoom: 'vcc room 3',
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 3 - 19:00 to 19:20',
      timings: '19:00 to 19:20',
    },
  }

  beforeEach(() => {
    controller = new ChangeDateAndTimeController(bookingService)
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
          changeTime: false,
          date: null,
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          startTimeHours: null,
          startTimeMinutes: null,
          endTimeHours: null,
          endTimeMinutes: null,
          errors: [],
          postAppointmentRequired: null,
          preAppointmentRequired: null,
        })
      })

      it('When changing time only', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({ errors: [], input: [] })

        await controller.view(true)(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeDateAndTime.njk', {
          bookingId: 123,
          changeTime: true,
          date: '20/11/2020',
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          startTimeHours: null,
          startTimeMinutes: null,
          endTimeHours: null,
          endTimeMinutes: null,
          errors: [],
          postAppointmentRequired: null,
          preAppointmentRequired: null,
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
              date: '20/11/2020',
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
          changeTime: false,
          date: '20/11/2020',
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          startTimeHours: '11',
          startTimeMinutes: '20',
          endTimeHours: '11',
          endTimeMinutes: '40',
          errors: [{ text: 'error message', href: 'error' }],
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
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
          changeTime: true,
          date: '21/11/2020',
          locations: { court: 'City of London', prison: 'some prison' },
          prisoner: { name: 'John Doe' },
          startTimeHours: '11',
          startTimeMinutes: '20',
          endTimeHours: '11',
          endTimeMinutes: '40',
          errors: [{ text: 'error message', href: 'error' }],
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
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
        changeTime: false,
        date: null,
        locations: { court: 'City of London', prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        startTimeHours: null,
        startTimeMinutes: null,
        endTimeHours: null,
        endTimeMinutes: null,
        errors: [{ text: 'error message', href: 'error' }],
        postAppointmentRequired: null,
        preAppointmentRequired: null,
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
        changeTime: true,
        date: '20/11/2020',
        locations: { court: 'City of London', prison: 'some prison' },
        prisoner: { name: 'John Doe' },
        startTimeHours: null,
        startTimeMinutes: null,
        endTimeHours: null,
        endTimeMinutes: null,
        errors: [{ text: 'error message', href: 'error' }],
        postAppointmentRequired: null,
        preAppointmentRequired: null,
      })
    })
  })

  describe('submit', () => {
    it('should display the available page on submit when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      req.params.bookingId = '12'

      await controller.submit(false)(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-available/12`)
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
        expect(req.flash).toHaveBeenCalledWith('input', req.body)
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

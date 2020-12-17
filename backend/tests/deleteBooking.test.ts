import { Request, Response } from 'express'
import DeleteBooking from '../controllers/appointments/deleteBooking'
import AppointmentService from '../services/appointmentsService'

jest.mock('../services/appointmentsService')

describe('Delete Booking', () => {
  const appointmentService = new AppointmentService(null, null) as jest.Mocked<AppointmentService>
  let controller: DeleteBooking
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  const bookingDetails = {
    courtDetails: {
      courtLocation: 'City of London',
    },
    details: {
      name: 'John Doe',
      prison: 'some prison',
      prisonRoom: 'vcc room 1',
    },
    hearingDetails: {
      comments: 'some comment',
      courtHearingEndTime: '19:00',
      courtHearingStartTime: '18:00',
      date: '20 November 2020',
    },
    prePostDetails: {
      'post-court hearing briefing': '19:00 to 19:20',
      'pre-court hearing briefing': '17:40 to 18:00',
    },
    videoBookingId: 123,
  }

  beforeEach(() => {
    controller = new DeleteBooking(appointmentService)
  })

  describe('viewDelete', () => {
    const errors = [{ href: '/error', text: 'An error has occurred' }] as any

    it('should return booking details', async () => {
      appointmentService.getBookingDetails.mockResolvedValue(bookingDetails)
      req.flash.mockReturnValue(errors)

      await controller.viewDelete()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'deleteAppointment/confirmDeleteBooking.njk',
        expect.objectContaining({
          bookingDetails,
          errors,
        })
      )
    })
  })

  describe('confirmDelete', () => {
    it('should redirect to /delete-bookings/:bookingId when no confirmDelete on body', async () => {
      await controller.confirmDelete()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/delete-booking/123')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#confirm-delete', text: 'Select Yes or No' }])
    })
    it('should redirect to /bookings when user selects no', async () => {
      req.body.confirmDelete = 'no'

      await controller.confirmDelete()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/bookings')
    })
    it('should redirect to /booking-delete-confirmed when user selects yes', async () => {
      req.body.confirmDelete = 'yes'
      const offenderNameAndBookingIds = {
        offenderName: 'John Doe',
        offenderNo: 'A12345',
        bookingId: 789,
      }
      appointmentService.deleteBooking.mockResolvedValue(offenderNameAndBookingIds)

      await controller.confirmDelete()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/booking-delete-confirmed')
      expect(appointmentService.deleteBooking).toHaveBeenCalledWith(res.locals, 123)
    })
  })

  describe('deleteConfirmed', () => {
    it('should redirect to /bookings if there is no flash state', async () => {
      req.flash.mockReturnValue({})

      await controller.deleteConfirmed()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/bookings')
    })
    it('should render bookingDeleteConfirmed page if flash state is present', async () => {
      req.flash.mockReturnValue({ offenderName: ['John Doe'], offenderNo: ['A12345'] })

      await controller.deleteConfirmed()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'deleteAppointment/bookingDeleteConfirmed.njk',
        expect.objectContaining({
          offenderName: 'John Doe',
          offenderNo: 'A12345',
        })
      )
    })
  })
})

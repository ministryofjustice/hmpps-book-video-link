import { Request, Response } from 'express'
import DeleteAppointment from '../controllers/appointments/deleteAppointment'
import AppointmentService from '../services/appointmentsService'

jest.mock('../services/appointmentsService')

describe('Delete appointments', () => {
  const appointmentService = new AppointmentService(null, null) as jest.Mocked<AppointmentService>
  let controller: DeleteAppointment
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  beforeEach(() => {
    controller = new DeleteAppointment(appointmentService)
  })

  describe('viewDelete', () => {
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

    const errors = [{ href: '/error', text: 'An error has occurred' }] as any

    it('should return booking details', async () => {
      appointmentService.getBookingDetails.mockResolvedValue(bookingDetails)
      req.flash.mockReturnValue(errors)

      await controller.viewDelete()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'deleteAppointment/videolinkBookingConfirmDelete.njk',
        expect.objectContaining({
          bookingDetails,
          errors,
        })
      )
    })
  })
})

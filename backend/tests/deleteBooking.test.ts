import { Request, Response } from 'express'
import DeleteBooking from '../routes/changeBooking/deleteBookingController'
import BookingService from '../services/bookingService'
import { BookingDetails } from '../services/model'

jest.mock('../services/bookingService')

describe('Delete Booking', () => {
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  let controller: DeleteBooking
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
    date: '20 November 2020',
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

  const bookingDetailsView = {
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
      'post-court hearing briefing': 'vcc room 3 - 19:00 to 19:20',
      'pre-court hearing briefing': 'vcc room 2 - 17:40 to 18:00',
    },
    videoBookingId: 123,
  }

  beforeEach(() => {
    controller = new DeleteBooking(bookingService)
  })

  describe('viewDelete', () => {
    const errors = [{ href: '/error', text: 'An error has occurred' }] as any

    it('should return booking details', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      req.flash.mockReturnValue(errors)

      await controller.viewDelete()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'changeBooking/confirmDeletion.njk',
        expect.objectContaining({
          bookingDetails: bookingDetailsView,
          errors,
        })
      )
    })
  })

  describe('confirmDeletion', () => {
    it('should redirect to /confirm-deletions/:bookingId when no confirmDeletion on body', async () => {
      await controller.confirmDeletion()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/confirm-deletion/123')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#confirm-deletion', text: 'Select Yes or No' }])
    })
    it('should redirect to /bookings when user selects no', async () => {
      req.body.confirmDeletion = 'no'

      await controller.confirmDeletion()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/bookings')
    })
    it('should redirect to /video-link-deleted when user selects yes', async () => {
      req.body.confirmDeletion = 'yes'
      const offenderNameAndBookingIds = {
        offenderName: 'John Doe',
        offenderNo: 'A12345',
        bookingId: 789,
      }
      bookingService.delete.mockResolvedValue(offenderNameAndBookingIds)

      await controller.confirmDeletion()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/video-link-deleted')
      expect(bookingService.delete).toHaveBeenCalledWith(res.locals, 'BOB_SMITH', 123)
    })
  })

  describe('deleteConfirmed', () => {
    it('should redirect to /bookings if there is no flash state', async () => {
      req.flash.mockReturnValue({})

      await controller.deleteConfirmed()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/bookings')
    })
    it('should render videoLinkDeleted page if flash state is present', async () => {
      req.flash.mockReturnValue({ offenderName: ['John Doe'], offenderNo: ['A12345'] })

      await controller.deleteConfirmed()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'changeBooking/videoLinkDeleted.njk',
        expect.objectContaining({
          offenderName: 'John Doe',
          offenderNo: 'A12345',
        })
      )
    })
  })
})

import { Request, Response } from 'express'
import moment from 'moment'
import ConfirmationController from './confirmationController'
import BookingService from '../../services/bookingService'
import { BookingDetails } from '../../services/model'

jest.mock('../../services/bookingService')

describe('video link is available controller', () => {
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  let controller: ConfirmationController
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
    date: moment('2020-11-20T18:00:00'),
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
      startTime: '19:00',
      endTime: '19:20',
      description: 'vcc room 3 - 19:00 to 19:20',
      timings: '19:00 to 19:20',
    },
  }

  beforeEach(() => {
    controller = new ConfirmationController(bookingService)
  })

  describe('view', () => {
    it('should display booking details', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'amendBooking/confirmation.njk',
        expect.objectContaining({
          bookingDetails: {
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
          },
        })
      )
    })
  })
})

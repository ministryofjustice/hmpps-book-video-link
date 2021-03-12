import moment from 'moment'
import VideoLinkIsAvailableController from './videoLinkIsAvailableController'
import BookingService from '../../services/bookingService'
import { BookingDetails } from '../../services/model'
import { DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/bookingService')

describe('video link is available controller', () => {
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  let controller: VideoLinkIsAvailableController

  const req = mockRequest({ params: { bookingId: '123' } })
  const res = mockResponse()

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    dateDescription: '20 November 2020',
    date: moment('20/11/2020', DAY_MONTH_YEAR),
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
    controller = new VideoLinkIsAvailableController(bookingService)
  })

  describe('view', () => {
    it('should redirect when no stored state', async () => {
      req.signedCookies = {}

      await controller.view()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/booking-details/123')
    })

    it('should display booking details', async () => {
      req.signedCookies = {
        'booking-update': {
          agencyId: 'WWI',
          date: '2020-11-20T18:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preRequired: 'true',
          postRequired: 'true',
        },
      }

      bookingService.get.mockResolvedValue(bookingDetails)

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking/videoLinkIsAvailable.njk', {
        bookingDetails: {
          videoBookingId: 123,
          details: {
            name: 'John Doe',
            prison: 'some prison',
            court: 'City of London',
          },
          hearingDetails: {
            date: '20 November 2020',
            courtHearingEndTime: '19:00',
            courtHearingStartTime: '18:00',
          },
          prePostDetails: {
            'pre-court hearing briefing': '17:40 to 18:00',
            'post-court hearing briefing': '19:00 to 19:20',
          },
        },
      })
    })
  })
})

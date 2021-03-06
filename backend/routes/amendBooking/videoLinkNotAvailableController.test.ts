import { mockRequest, mockResponse } from '../__test/requestTestUtils'

import VideoLinkNotAvailableController from './videoLinkNotAvailableController'

describe('video link is not available controller', () => {
  let controller: VideoLinkNotAvailableController

  const req = mockRequest({ params: { bookingId: '123' } })
  const res = mockResponse({})

  beforeEach(() => {
    controller = new VideoLinkNotAvailableController()
  })

  describe('view', () => {
    it('should redirect if no state', async () => {
      req.signedCookies = {}
      await controller.view()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/booking-details/123')
    })

    it('should render the page', async () => {
      req.signedCookies = {
        'booking-update': {
          agencyId: 'WWI',
          courtId: 'CLDN',
          date: '2020-11-20T18:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preLocation: '2',
          mainLocation: '1',
          postLocation: '3',
          preRequired: 'true',
          postRequired: 'true',
        },
      }

      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('amendBooking/videoLinkNotAvailable.njk', {
        bookingId: '123',
        data: {
          date: 'Friday 20 November 2020',
          endTime: '19:15',
          startTime: '17:45',
        },
      })
    })
  })

  describe('submit', () => {
    it('should display booking details', async () => {
      req.signedCookies = {
        'booking-update': {
          agencyId: 'WWI',
          courtId: 'CLDN',
          date: '2020-11-20T18:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preLocation: '2',
          mainLocation: '1',
          preRequired: 'true',
          postRequired: 'false',
        },
      }

      await controller.submit()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith(`/change-video-link-date-and-time/123`)
      expect(req.flash).toBeCalledWith('input', {
        date: '20/11/2020',
        startTimeHours: '18',
        startTimeMinutes: '00',
        endTimeHours: '19',
        endTimeMinutes: '00',
        preRequired: 'true',
        postRequired: 'false',
      })
    })
  })

  describe('roomNoLongerAvailable', () => {
    it('should render the page', async () => {
      await controller.roomNoLongerAvailable()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('amendBooking/roomNoLongerAvailable.njk', { bookingId: '123' })
    })
  })
})

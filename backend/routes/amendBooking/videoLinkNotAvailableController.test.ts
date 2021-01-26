import { Request, Response } from 'express'

import VideoLinkNotAvailableController from './videoLinkNotAvailableController'

describe('video link is not available controller', () => {
  let controller: VideoLinkNotAvailableController

  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

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
          date: '2020-11-20T18:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preAppointmentRequired: 'true',
          postAppointmentRequired: 'true',
        },
      }

      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('amendBooking/videoLinkNotAvailable.njk', {
        bookingId: 123,
        data: {
          date: 'Friday 20 November 2020',
          endTime: '19:20',
          startTime: '17:40',
        },
      })
    })
  })

  describe('submit', () => {
    it('should display booking details', async () => {
      req.signedCookies = {
        'booking-update': {
          date: '2020-11-20T18:00:00',
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          preAppointmentRequired: 'true',
          postAppointmentRequired: 'false',
        },
      }

      await controller.submit()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith(`/change-date-and-time/123`)
      expect(req.flash).toBeCalledWith('input', {
        date: '20/11/2020',
        startTimeHours: '18',
        startTimeMinutes: '00',
        endTimeHours: '19',
        endTimeMinutes: '00',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'no',
      })
    })
  })
})

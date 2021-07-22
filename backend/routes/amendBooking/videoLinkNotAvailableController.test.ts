import { mockRequest, mockResponse } from '../__test/requestTestUtils'
import { AvailabilityCheckService } from '../../services'
import { RoomAvailability } from '../../services/model'
import VideoLinkNotAvailableController from './videoLinkNotAvailableController'
import { ChangeVideoLinkBookingCodec } from './state'

jest.mock('../../services')

describe('video link is not available controller', () => {
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

  const alternatives = [
    {
      pre: { locationId: 1, interval: { start: '12:45', end: '13:00' } },
      main: { locationId: 2, interval: { start: '13:00', end: '13:30' } },
      post: { locationId: 3, interval: { start: '13:30', end: '13:45' } },
    },
  ]

  const availability: RoomAvailability = {
    isAvailable: false,
    alternatives,
    totalInterval: { start: '11:00', end: '14:00' },
  }

  let controller: VideoLinkNotAvailableController

  const res = mockResponse({})

  beforeEach(() => {
    availabilityCheckService.getAvailability.mockResolvedValue(availability)
    controller = new VideoLinkNotAvailableController(availabilityCheckService)
  })

  describe('view', () => {
    it('should call availability service correctly', async () => {
      const req = mockRequest({
        params: { bookingId: '123' },
        signedCookies: {
          'booking-update': {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: '2020-11-20T00:00:00',
            startTime: '2020-11-20T11:00:00',
            endTime: '2020-11-20T14:00:00',
            preLocation: '2',
            mainLocation: '1',
            postLocation: '3',
            preRequired: 'true',
            postRequired: 'true',
          },
        },
      })

      await controller.view()(req, res, null)
      const update = ChangeVideoLinkBookingCodec.read(req.signedCookies['booking-update'])
      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(res.locals, {
        videoBookingId: 123,
        ...update,
      })
    })

    it('should redirect back to booking search page if have since selected an available option', async () => {
      const req = mockRequest({
        params: { bookingId: '123' },
        body: {},
        signedCookies: {
          'booking-update': {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: '2020-11-20T00:00:00',
            startTime: '2020-11-20T11:00:00',
            endTime: '2020-11-20T14:00:00',
            preLocation: '2',
            mainLocation: '1',
            postLocation: '3',
            preRequired: 'true',
            postRequired: 'true',
          },
        },
      })

      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        alternatives: [],
        totalInterval: { start: '11:00', end: '14:00' },
      })

      await controller.view()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/change-video-link/123')
    })

    it('should render the page', async () => {
      const req = mockRequest({
        params: { bookingId: '123' },
        signedCookies: {
          'booking-update': {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: '2020-11-20T00:00:00',
            startTime: '2020-11-20T14:00:00',
            endTime: '2020-11-20T17:00:00',
            preLocation: '2',
            mainLocation: '1',
            postLocation: '3',
            preRequired: 'true',
            postRequired: 'true',
          },
        },
      })

      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('amendBooking/videoLinkNotAvailable.njk', {
        continueLink: '/change-video-link/123',
        alternatives: [
          {
            rows: [
              {
                name: 'Date',
                value: '20 November 2020',
              },
              {
                name: 'Court hearing start time',
                value: '13:00',
              },
              {
                name: 'Court hearing end time',
                value: '13:30',
              },
              {
                name: 'Pre-court hearing briefing',
                value: '12:45 to 13:00',
              },
              {
                name: 'Post-court hearing briefing',
                value: '13:30 to 13:45',
              },
            ],
            values: {
              startTime: '2020-11-20T13:00:00',
              endTime: '2020-11-20T13:30:00',
            },
          },
        ],
      })
    })

    describe('submit', () => {
      it('selecting alternative updates booking', async () => {
        const req = mockRequest({
          params: { bookingId: '123' },
          body: { startTime: '2021-11-20T12:00:00', endTime: '2021-11-20T12:30:00' },
          signedCookies: {
            'booking-update': {
              agencyId: 'WWI',
              courtId: 'CLDN',
              date: '2020-11-20T00:00:00',
              startTime: '2020-11-20T11:00:00',
              endTime: '2020-11-20T14:00:00',
              preLocation: '2',
              mainLocation: '1',
              postLocation: '3',
              preRequired: 'true',
              postRequired: 'true',
            },
          },
        })

        controller.submit()(req, res, null)

        expect(res.cookie).toHaveBeenCalledWith(
          'booking-update',
          {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: '2020-11-20T00:00:00',
            startTime: '2021-11-20T12:00:00',
            endTime: '2021-11-20T12:30:00',
            preLocation: '2',
            mainLocation: '1',
            postLocation: '3',
            preRequired: 'true',
            postRequired: 'true',
          },
          expect.any(Object)
        )
      })
    })
  })
})

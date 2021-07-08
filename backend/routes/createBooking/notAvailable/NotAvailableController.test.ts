import NotAvailableController from './NotAvailableController'
import { RoomAvailabilityV2 } from '../../../services/model'
import { mockRequest, mockResponse } from '../../__test/requestTestUtils'
import { AvailabilityCheckServiceV2 } from '../../../services'
import { NewBookingCodec } from '../state'

const availabilityCheckService = new AvailabilityCheckServiceV2(null) as jest.Mocked<AvailabilityCheckServiceV2>

jest.mock('../../../services')

describe('Not available page', () => {
  const alternatives = [
    {
      pre: { locationId: 1, interval: { start: '12:45', end: '13:00' } },
      main: { locationId: 2, interval: { start: '13:00', end: '13:30' } },
      post: { locationId: 3, interval: { start: '13:30', end: '13:45' } },
    },
  ]

  const availability: RoomAvailabilityV2 = {
    isAvailable: false,
    alternatives,
    totalInterval: { start: '11:00', end: '14:00' },
  }

  const signedCookies = {
    'booking-creation': {
      courtId: 'LEEMC',
      bookingId: '123456',
      date: '2017-11-10T00:00:00',
      postRequired: 'true',
      preRequired: 'true',
      endTime: '2017-11-10T14:00:00',
      startTime: '2017-11-10T11:00:00',
      mainLocation: '2',
      preLocation: '1',
      postLocation: '3',
    },
  }

  const context = { user: { username: 'USER-1' } }
  const res = mockResponse({ locals: context })

  let controller: NotAvailableController

  beforeEach(() => {
    jest.resetAllMocks()

    availabilityCheckService.getAvailability.mockResolvedValue(availability)
    controller = new NotAvailableController(availabilityCheckService)
  })

  describe('view', () => {
    it('should call availability service correctly', async () => {
      const req = mockRequest({
        params: {
          offenderNo: 'A12345',
          agencyId: 'MDI',
        },
        body: {},
        signedCookies,
      })

      await controller.view(req, res, null)
      const newBooking = NewBookingCodec.read(req.signedCookies['booking-creation'])
      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(context, {
        agencyId: 'MDI',
        ...newBooking,
      })
    })

    it('should render template with data', async () => {
      const req = mockRequest({
        params: {
          offenderNo: 'A12345',
          agencyId: 'MDI',
        },
        body: {},
        signedCookies,
      })

      await controller.view(req, res, null)

      expect(res.render).toHaveBeenCalledWith('createBooking/notAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        alternatives: [
          {
            rows: [
              {
                name: 'Date',
                value: '10 November 2017',
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
              startTime: '2017-11-10T13:00:00',
              endTime: '2017-11-10T13:30:00',
            },
          },
        ],
      })
    })
  })
  describe('submit', () => {
    it('selecting alternative updates booking', async () => {
      const req = mockRequest({
        params: {
          offenderNo: 'A12345',
          agencyId: 'MDI',
        },
        body: { startTime: '2021-01-11T12:00:00', endTime: '2021-01-11T12:30:00' },
        signedCookies,
      })

      controller.submit(req, res, null)

      expect(res.cookie).toHaveBeenCalledWith(
        'booking-creation',
        {
          courtId: 'LEEMC',
          bookingId: '123456',
          date: '2017-11-10T00:00:00',
          postRequired: 'true',
          preRequired: 'true',
          startTime: '2021-01-11T12:00:00',
          endTime: '2021-01-11T12:30:00',
          mainLocation: '2',
          preLocation: '1',
          postLocation: '3',
        },
        expect.any(Object)
      )
    })
  })
})

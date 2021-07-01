import NotAvailableController from './NotAvailableController'
import { RoomAvailability } from '../../../services/model'
import { mockRequest, mockResponse } from '../../__test/requestTestUtils'
import { AvailabilityCheckService } from '../../../services'
import { NewBookingCodec } from '../state'

const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

jest.mock('../../../services')

describe('Not available page', () => {
  const bookingSlot = {
    isAvailable: true,
    totalInterval: { start: '11:00', end: '14:00' },
  } as RoomAvailability

  const req = mockRequest({
    params: {
      offenderNo: 'A12345',
      agencyId: 'MDI',
    },
    body: {},
    signedCookies: {
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
    },
  })

  const context = { user: { username: 'USER-1' } }
  const res = mockResponse({ locals: context })

  let controller: NotAvailableController

  beforeEach(() => {
    jest.resetAllMocks()

    req.flash.mockReturnValue([])

    availabilityCheckService.getAvailability.mockResolvedValue(bookingSlot)
    controller = new NotAvailableController(availabilityCheckService)
  })

  describe('view', () => {
    it('should call availability service correctly', async () => {
      await controller.view(req, res, null)
      const newBooking = NewBookingCodec.read(req.signedCookies['booking-creation'])
      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(context, {
        agencyId: 'MDI',
        ...newBooking,
      })
    })

    it('should render template with data', async () => {
      await controller.view(req, res, null)

      expect(res.render).toHaveBeenCalledWith('createBooking-v2/notAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        date: 'Friday 10 November 2017',
        endTime: '14:00',
        startTime: '11:00',
      })
    })
  })
})

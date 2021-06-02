import moment from 'moment'
import type { BookingDetails } from '../../services/model'
import ConfirmationController from './confirmationController'
import { BookingService, LocationService } from '../../services'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services')

describe('Confirm appointments', () => {
  const req = mockRequest({ params: { videoBookingId: '123' } })
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    courtId: 'CLDN',
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

  let controller: ConfirmationController
  const bookingService = new BookingService(null, null, null, null, null) as jest.Mocked<BookingService>
  const locationService = new LocationService(null, null, null, null) as jest.Mocked<LocationService>
  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ConfirmationController(bookingService, locationService)
  })

  it('should render page', async () => {
    bookingService.get.mockResolvedValue(bookingDetails)
    locationService.getVideoLinkEnabledCourt.mockResolvedValue({ text: 'City of London', value: 'City of London' })

    await controller.view(req, res, null)

    expect(res.render).toHaveBeenCalledWith('createBooking/confirmation.njk', {
      videolinkPrisonerSearchLink: '/prisoner-search',
      offender: {
        name: 'John Doe',
        prisonRoom: 'vcc room 1',
        prison: 'some prison',
      },
      details: {
        comments: 'some comment',
        courtHearingEndTime: '19:00',
        courtHearingStartTime: '18:00',
        date: '20 November 2020',
      },
      prepostData: {
        'pre-court hearing briefing': 'vcc room 2 - 17:40 to 18:00',
        'post-court hearing briefing': 'vcc room 3 - 19:00 to 19:20',
      },
      court: { courtLocation: 'City of London' },
    })
  })

  it('Should call booking service with correct params', async () => {
    bookingService.get.mockResolvedValue(bookingDetails)
    locationService.getVideoLinkEnabledCourt.mockResolvedValue({ text: 'City of London', value: 'City of London' })

    await controller.view(req, res, null)

    expect(bookingService.get).toBeCalledWith(res.locals, 123)
  })

  it('Should call location service with correct params', async () => {
    bookingService.get.mockResolvedValue(bookingDetails)
    locationService.getVideoLinkEnabledCourt.mockResolvedValue({ text: 'City of London', value: 'City of London' })

    await controller.view(req, res, null)

    expect(locationService.getVideoLinkEnabledCourt).toBeCalledWith(res.locals, 'CLDN', 'A_USER')
  })
})

import { Request, Response } from 'express'
import moment from 'moment'

import SelectAvailableRoomsController from './selectAvailableRoomsController'
import BookingService from '../../services/bookingService'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { BookingDetails, RoomAvailability } from '../../services/model'
import { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'

jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('Select available rooms controller', () => {
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  let controller: SelectAvailableRoomsController
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
    date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
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
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 3 - 19:00 to 19:20',
      timings: '19:00 to 19:20',
    },
  }

  const availableLocations: RoomAvailability = {
    isAvailable: true,
    totalInterval: { start: '09:00', end: '10:00' },
    rooms: {
      main: [{ value: 1, text: 'Room 1' }],
      pre: [{ value: 2, text: 'Room 2' }],
      post: [{ value: 3, text: 'Room 3' }],
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new SelectAvailableRoomsController(bookingService, availabilityCheckService)
  })

  describe('view', () => {
    it('should display booking details', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'amendBooking/selectAvailableRooms.njk',
        expect.objectContaining({
          preAppointmentRequired: true,
          postAppointmentRequired: true,
          comments: 'some comment',
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        })
      )
    })

    it('should call the existingEventsService with correct video link booking details', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)

      await controller.view()(req, res, null)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(res.locals, {
        agencyId: 'WWI',
        date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        postRequired: true,
        preRequired: true,
      })
    })
  })

  describe('submit', () => {
    it('should display booking details', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      req.params.bookingId = '12'

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-change-confirmed/12`)
    })
  })
})

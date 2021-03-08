import moment from 'moment'
import { Agency, InmateDetail } from 'prisonApi'

import SelectRoomsController from './selectRoomsController'
import config from '../../config'
import PrisonApi from '../../api/prisonApi'
import BookingService from '../../services/bookingService'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { RoomAvailability } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'

jest.mock('../../api/prisonApi')
jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('Select court appointment rooms', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  let controller

  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'WWI', offenderNo: 'A12345' },
    session: { userDetails: { username: 'USER-1' } },
    body: {},
    flash: jest.fn(),
  }
  const res = { locals: {}, redirect: jest.fn(), render: jest.fn() }

  const bookingId = 1
  const appointmentDetails = {
    bookingId,
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    locationId: 1,
    startTime: '2017-11-10T11:00:00',
    endTime: '2017-11-10T14:00:00',
    comment: 'Test',
    date: '10/11/2017',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
    preLocations: [{ value: 1, text: 'Room 1' }],
    postLocations: [{ value: 3, text: 'Room 3' }],
    court: 'Leeds',
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

    prisonApi.getPrisonerDetails.mockResolvedValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
    } as InmateDetail)

    bookingService.create.mockResolvedValue(123)

    prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Moorland' } as Agency)
    availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
    req.flash.mockReturnValue([appointmentDetails])

    controller = new SelectRoomsController(prisonApi, bookingService, availabilityCheckService)
  })

  describe('view', () => {
    it('should return locations', async () => {
      const { view } = controller

      await view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          mainLocations: [{ text: 'Room 1', value: 1 }],
          postLocations: [{ text: 'Room 3', value: 3 }],
          preLocations: [{ text: 'Room 2', value: 2 }],
        })
      )
    })

    it('should extract appointment details', async () => {
      const { view } = controller

      await view(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          details: {
            date: '10 November 2017',
            endTime: '14:00',
            prisonerName: 'John Doe',
            startTime: '11:00',
            prison: 'Moorland',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { view } = controller

      req.flash.mockReturnValue([])

      await expect(view(req, res)).rejects.toThrow('Appointment details are missing')
    })

    it('should call getAvailableLocationsForVLB with the correct parameters', async () => {
      const { view } = controller

      await view(req, res)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'WWI',
          date: moment('10/11/2017', DAY_MONTH_YEAR, true),
          startTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          endTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          postRequired: true,
          preRequired: true,
        }
      )
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      req.flash.mockReturnValue([
        {
          ...appointmentDetails,
          startTime: '2017-10-10T11:00',
          endTime: '2017-10-10T14:00',
        },
      ])

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      res.redirect = jest.fn()
      config.notifications.emails.WWI.omu = 'omu@prison.com'
      config.notifications.emails.WWI.vlb = 'vlb@prison.com'
    })

    it('should redirect back when errors in request', async () => {
      const { submit } = controller

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      await submit({ ...req, errors: [{ href: '#preLocation' }] }, res)

      expect(res.redirect).toHaveBeenCalledWith('/WWI/offenders/A12345/add-court-appointment/select-rooms')
      expect(bookingService.create).not.toHaveBeenCalled()
    })

    it('should redirect to confirmation page', async () => {
      const { submit } = controller

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      await submit(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    it('should redirect to confirmation page if no pre or post rooms are required', async () => {
      req.flash.mockReturnValue([
        {
          ...appointmentDetails,
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        },
      ])
      const { submit } = controller

      req.body = {
        mainLocation: '2',
        comment: 'Test',
      }

      await submit(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    describe('should call the booking service with correct details', () => {
      it('with all fields ', async () => {
        const { submit } = controller
        req.flash.mockReturnValue([
          {
            ...appointmentDetails,
            preLocations: [{ value: 1, text: 'Room 1' }],
            mainLocations: [{ value: 2, text: 'Room 2' }],
            postLocations: [{ value: 3, text: 'Room 3' }],
          },
        ])

        req.body = {
          preLocation: '1',
          mainLocation: '2',
          postLocation: '3',
          comment: 'Test',
        }

        await submit(req, res)

        expect(bookingService.create).toBeCalledWith(res.locals, 'USER-1', {
          agencyId: 'WWI',
          court: 'Leeds',
          comment: 'Test',
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC),
          offenderNo: 'A12345',
          pre: 1,
          main: 2,
          post: 3,
        })
      })

      it('with only mandatory fields ', async () => {
        const { submit } = controller
        req.flash.mockReturnValue([
          {
            ...appointmentDetails,
            mainLocations: [{ value: 2, text: 'Room 2' }],
          },
        ])

        req.body = {
          mainLocation: '2',
        }

        await submit(req, res)

        expect(bookingService.create).toBeCalledWith(res.locals, 'USER-1', {
          agencyId: 'WWI',
          court: 'Leeds',
          comment: undefined,
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC),
          offenderNo: 'A12345',
          pre: undefined,
          main: 2,
          post: undefined,
        })
      })
    })
  })
})

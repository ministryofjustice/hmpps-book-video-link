import moment from 'moment'
import { Agency, InmateDetail } from 'prisonApi'

import selectRoomsController from './selectRoomsController'
import { notifyApi } from '../../api/notifyApi'
import config from '../../config'
import PrisonApi from '../../api/prisonApi'
import BookingService from '../../services/bookingService'
import AvailabilityCheckService from '../../services/availabilityCheckService'
import { Services } from '../../services'
import { RoomAvailability } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'

jest.mock('../../api/prisonApi')
jest.mock('../../services/bookingService')
jest.mock('../../services/availabilityCheckService')

describe('Select court appointment rooms', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const bookingService = new BookingService(null, null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  const oauthApi = { userEmail: jest.fn() } as any
  let controller

  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'WWI', offenderNo: 'A12345' },
    session: { userDetails: { name: 'Court User' } },
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

    prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Moorland' } as Agency)
    availabilityCheckService.getAvailability.mockResolvedValue(availableLocations)
    req.flash.mockReturnValue([appointmentDetails])

    notifyApi.sendEmail = jest.fn()

    controller = selectRoomsController(({
      prisonApi,
      bookingService,
      availabilityCheckService,
      oauthApi,
      notifyApi,
    } as unknown) as Services)
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

      req.flash.mockImplementation(() => [])

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
      req.flash.mockImplementation(() => [
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
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
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

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
    })

    it('should redirect to confirmation page if no pre or post rooms are required', async () => {
      req.flash.mockImplementation(() => [
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

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
    })

    it('should call the appointment service with correct appointment details', async () => {
      const { submit } = controller
      req.flash.mockImplementation(() => [
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

      expect(bookingService.create).toBeCalledWith(
        {},
        {
          bookingId: 1,
          court: 'Leeds',
          comment: 'Test',
          pre: { endTime: '2017-11-10T11:00:00', locationId: 1, startTime: '2017-11-10T10:40:00' },
          main: { endTime: '2017-11-10T14:00:00', locationId: 2, startTime: '2017-11-10T11:00:00' },
          post: { endTime: '2017-11-10T14:20:00', locationId: 3, startTime: '2017-11-10T14:00:00' },
        }
      )
    })
    it('should try to send email with court template when court user has email', async () => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      oauthApi.userEmail.mockReturnValue({
        email: 'test@example.com',
      })

      const { submit } = controller

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      await submit(req, res)

      const personalisation = {
        startTime: '11:00',
        endTime: '14:00',
        date: '10 November 2017',
        comments: appointmentDetails.comment,
        court: 'Leeds',
        firstName: 'John',
        lastName: 'Doe',
        offenderNo: appointmentDetails.offenderNo,
        location: 'Room 2',
        postAppointmentInfo: 'Room 3, 14:00 to 14:20',
        preAppointmentInfo: 'Room 1, 10:40 to 11:00',
        userName: 'Court User',
      }

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.confirmBookingCourtTemplateId,
        'test@example.com',
        {
          personalisation,
          reference: null,
        }
      )
    })

    it('should try to send emails to prison', async () => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      oauthApi.userEmail.mockReturnValue({ email: 'test@example.com' })

      const { submit } = controller

      req.body = {
        preLocation: '1',
        mainLocation: '2',
        postLocation: '3',
        comment: 'Test',
      }

      await submit(req, res)

      const personalisation = {
        startTime: '11:00',
        endTime: '14:00',
        date: '10 November 2017',
        comments: appointmentDetails.comment,
        court: 'Leeds',
        firstName: 'John',
        lastName: 'Doe',
        offenderNo: appointmentDetails.offenderNo,
        location: 'Room 2',
        postAppointmentInfo: 'Room 3, 14:00 to 14:20',
        preAppointmentInfo: 'Room 1, 10:40 to 11:00',
        userName: 'Court User',
      }

      expect(notifyApi.sendEmail).toBeCalledTimes(3)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.confirmBookingCourtTemplateId,
        'test@example.com',
        {
          personalisation,
          reference: null,
        }
      )
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.prisonCourtBookingTemplateId,
        'omu@prison.com',
        {
          personalisation,
          reference: null,
        }
      )
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.prisonCourtBookingTemplateId,
        'vlb@prison.com',
        {
          personalisation,
          reference: null,
        }
      )
    })
  })
})

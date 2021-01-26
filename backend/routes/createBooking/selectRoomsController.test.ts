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
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
  const oauthApi = { userEmail: jest.fn() } as any
  let controller

  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Court User' } },
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

  describe('index', () => {
    it('should return locations', async () => {
      const { index } = controller

      await index(req, res)

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
      const { index } = controller

      await index(req, res)

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
      const { index } = controller

      req.flash.mockImplementation(() => [])

      await expect(index(req, res)).rejects.toThrow('Appointment details are missing')
    })

    it('should call getAvailableLocationsForVLB with the correct parameters', async () => {
      const { index } = controller

      await index(req, res)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'MDI',
          date: moment('10/11/2017', DAY_MONTH_YEAR, true),
          startTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          endTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          postRequired: true,
          preRequired: true,
        }
      )
    })
  })

  describe('validateInput', () => {
    it('should return a validation message if the pre or post appointment location is the same as the main appointment location', async () => {
      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '1',
        selectPostAppointmentLocation: '1',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      const { validateInput } = controller
      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          errors: [
            {
              text: 'Select a different room for the post-court hearing to the room for the court hearing briefing',
              href: '#selectPostAppointmentLocation',
            },
            {
              text: 'Select a different room for the pre-court hearing to the room for the court hearing briefing',
              href: '#selectPreAppointmentLocation',
            },
          ],
        })
      )
    })

    it('should validate presence of room locations', async () => {
      const { validateInput } = controller

      req.body = {
        selectPreAppointmentLocation: null,
        selectMainAppointmentLocation: null,
        selectPostAppointmentLocation: null,
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          errors: [
            { text: 'Select a prison room for the court hearing video link', href: '#selectMainAppointmentLocation' },
            { text: 'Select a prison room for the pre-court hearing briefing', href: '#selectPreAppointmentLocation' },
            {
              text: 'Select a prison room for the post-court hearing briefing',
              href: '#selectPostAppointmentLocation',
            },
          ],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { validateInput } = controller
      const comment = 'Some supporting comment text'

      req.body = { comment }

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          formValues: { comment },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { validateInput } = controller

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
        },
      ])

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectRooms.njk',
        expect.objectContaining({
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
          details: {
            date: '10 November 2017',
            startTime: '11:00',
            endTime: '14:00',
            prisonerName: 'John Doe',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { validateInput } = controller

      req.flash.mockImplementation(() => [])
      expect(() => validateInput(req, res)).toThrow('Appointment details are missing')
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { validateInput } = controller

      await validateInput(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
    })
  })

  describe('createAppointments', () => {
    beforeEach(() => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          startTime: '2017-10-10T11:00',
          endTime: '2017-10-10T14:00',
        },
      ])

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      res.redirect = jest.fn()
    })

    it('should redirect to confirmation page', async () => {
      const { createAppointments } = controller

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

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
      const { createAppointments } = controller

      req.body = {
        selectMainAppointmentLocation: '2',
        comment: 'Test',
      }

      await createAppointments(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
    })

    it('should call the appointment service with correct appointment details', async () => {
      const { createAppointments } = controller
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

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

      const { createAppointments } = controller

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

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
  })
})

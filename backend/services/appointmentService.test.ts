import type { Location, InmateDetail } from 'prisonApi'
import AppointmentService from './appointmentService'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import NotificationService from './notificationService'
import { BookingDetails } from './model'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const notificationService = new NotificationService(null, null) as jest.Mocked<NotificationService>

const offenderDetails = {
  bookingId: 789,
  firstName: 'john',
  lastName: 'doe',
  offenderNo: 'A1234AA',
} as InmateDetail

const agencyDetail = {
  active: true,
  agencyId: 'WWI',
  agencyType: '',
  description: 'some prison',
}

const room = (i, description = `VCC ROOM ${i}`, userDescription = `Vcc Room ${i}`) =>
  ({
    description,
    locationId: i,
    userDescription,
  } as Location)

const bookingDetail: BookingDetails = {
  agencyId: 'WWI',
  offenderNo: 'A1234AA',
  comments: 'some comment',
  courtLocation: 'City of London',
  date: '20 November 2020',
  prisonBookingId: 789,
  prisonName: 'some prison',
  prisonerName: 'John Doe',
  videoBookingId: 123,
  preDetails: {
    description: 'Vcc Room 3 - 17:40 to 18:00',
    endTime: '18:00',
    prisonRoom: 'Vcc Room 3',
    startTime: '17:40',
  },
  mainDetails: {
    description: 'Vcc Room 1 - 18:00 to 19:00',
    endTime: '19:00',
    prisonRoom: 'Vcc Room 1',
    startTime: '18:00',
  },
  postDetails: {
    description: 'Vcc Room 2 - 19:00 to 19:20',
    endTime: '19:20',
    prisonRoom: 'Vcc Room 2',
    startTime: '19:00',
  },
}

describe('Appointments service', () => {
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities', activeFlag: 'Y' as const, domain: '' }]
  const locations = [room(27187, 'RES-MCASU-MCASU', 'Adj'), room(27188, 'RES-MCASU-MCASU', null)]

  let appointmentService: AppointmentService

  beforeEach(() => {
    appointmentService = new AppointmentService(prisonApi, whereaboutsApi, notificationService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get appointment options', () => {
    it('Should make a request for appointment locations and types', async () => {
      await appointmentService.getAppointmentOptions(context, agency)

      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
    })

    it('Should handle empty responses from appointment types and locations', async () => {
      const response = await appointmentService.getAppointmentOptions(context, agency)

      expect(response).toEqual({})
    })

    it('Should map appointment types and locations correctly', async () => {
      prisonApi.getLocationsForAppointments.mockResolvedValue(locations)
      prisonApi.getAppointmentTypes.mockResolvedValue(appointmentTypes)

      const response = await appointmentService.getAppointmentOptions(context, agency)

      expect(response).toEqual({
        appointmentTypes: [{ value: 'ACTI', text: 'Activities' }],
        locationTypes: [
          { value: 27187, text: 'Adj' },
          { value: 27188, text: 'RES-MCASU-MCASU' },
        ],
      })
    })
  })

  describe('Create booking', () => {
    it('Creating a booking with mandatory fields', async () => {
      const appointmentDetails = {
        bookingId: 1000,
        date: '20/11/2020',
        startTime: '2020-11-20T18:00:00',
        endTime: '2020-11-20T19:00:00',
        startTimeHours: '18',
        startTimeMinutes: '00',
        endTimeHours: '19',
        endTimeMinutes: '00',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        court: 'City of London',
      }

      await appointmentService.createAppointmentRequest(
        appointmentDetails,
        'some comment',
        {
          preAppointment: {
            startTime: '2020-11-20T17:40:00',
            endTime: '2020-11-20T18:00:00',
            locationId: 1,
          },
          postAppointment: {
            startTime: '2020-11-20T19:00:00',
            endTime: '2020-11-20T19:20:00',
            locationId: 3,
          },
        },
        '2',
        context
      )

      expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
        bookingId: 1000,
        court: 'City of London',
        comment: 'some comment',
        madeByTheCourt: true,
        pre: {
          startTime: '2020-11-20T17:40:00',
          endTime: '2020-11-20T18:00:00',
          locationId: 1,
        },
        main: {
          locationId: 2,
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
        },
        post: {
          startTime: '2020-11-20T19:00:00',
          endTime: '2020-11-20T19:20:00',
          locationId: 3,
        },
      })
    })

    it('Creating a booking with optional fields', async () => {
      const appointmentDetails = {
        bookingId: 1000,
        date: '20/11/2020',
        startTime: '2020-11-20T18:00:00',
        endTime: '2020-11-20T19:00:00',
        startTimeHours: '18',
        startTimeMinutes: '00',
        endTimeHours: '19',
        endTimeMinutes: '00',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        court: 'City of London',
      }

      await appointmentService.createAppointmentRequest(appointmentDetails, undefined, {}, '2', context)

      expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
        bookingId: 1000,
        court: 'City of London',
        madeByTheCourt: true,
        main: {
          locationId: 2,
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
        },
      })
    })
  })

  describe('Get Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should get booking details successfully', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      const result = await appointmentService.getBookingDetails(context, 123)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 123)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledTimes(1)
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'WWI')

      expect(result).toStrictEqual(bookingDetail)
    })
  })

  describe('Delete Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should call whereaboutsApi and PrisonApi correctly when deleting a booking', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await appointmentService.deleteBooking(context, 'A_USER', 123)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 123)
      expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)
      expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 123)
      expect(notificationService.sendCancellationEmails).toHaveBeenCalledWith(context, 'A_USER', bookingDetail)
    })

    it('Should return the offender identifiers when deleting a booking', () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      return expect(appointmentService.deleteBooking(context, 'A_USER', 123)).resolves.toStrictEqual({
        offenderNo: 'A1234AA',
        offenderName: 'John Doe',
      })
    })
  })
})

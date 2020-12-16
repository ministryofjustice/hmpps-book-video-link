import type prisonApiTypes from 'prisonApi'
import AppointmentsService from '../services/appointmentsService'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

type InmateDetail = prisonApiTypes.schemas['InmateDetail']

describe('Appointments service', () => {
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities', activeFlag: 'Y' as const, domain: '' }]
  const locationTypes = [
    {
      locationId: 27187,
      locationType: 'ADJU',
      description: 'RES-MCASU-MCASU',
      agencyId: 'MDI',
      parentLocationId: 27186,
      currentOccupancy: 0,
      locationPrefix: 'MDI-RES-MCASU-MCASU',
      userDescription: 'Adj',
    },
    {
      locationId: 27188,
      locationType: 'ADJU',
      description: 'RES-MCASU-MCASU',
      agencyId: 'MDI',
      parentLocationId: 27186,
      currentOccupancy: 0,
      locationPrefix: 'MDI-RES-MCASU-MCASU',
    },
  ]

  let appointmentService
  let res = { locals: {} }

  beforeEach(() => {
    appointmentService = new AppointmentsService(prisonApi, whereaboutsApi)
    res = { locals: {} }
  })

  it('should make a request for appointment locations and types', async () => {
    await appointmentService.getAppointmentOptions(context, agency)

    expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
    expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await appointmentService.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    prisonApi.getLocationsForAppointments.mockResolvedValue(locationTypes)
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

  it('should call whereaboutsApi with the right appointment details when all details present', () => {
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

    const comment = 'some comment'
    const selectMainAppointmentLocation = 2

    const prepostAppointments = {
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
    }

    appointmentService.createAppointmentRequest(
      appointmentDetails,
      comment,
      prepostAppointments,
      selectMainAppointmentLocation,
      res.locals
    )

    expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(res.locals, {
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

  it('should call whereaboutsApi with the right appointment details - but comments,  pre and post appointments not required', () => {
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

    const selectMainAppointmentLocation = 2

    const prepostAppointments = {}
    const comment = undefined
    appointmentService.createAppointmentRequest(
      appointmentDetails,
      comment,
      prepostAppointments,
      selectMainAppointmentLocation,
      res.locals
    )

    expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(res.locals, {
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
  describe('getBooking', () => {
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

    const offenderDetails = {
      bookingId: 789,
      firstName: 'john',
      lastName: 'doe',
      offenderNo: 'A1234AA',
    } as InmateDetail

    it('should get booking details successfully', async () => {
      const agencyDetail = {
        active: true,
        agencyId: 'WWI',
        agencyType: '',
        description: 'some prison',
      }

      const vccRoom = {
        agencyId: 'WWI',
        currentOccupancy: 2,
        description: 'vcc room 1',
        internalLocationCode: 'string',
        locationId: 1,
        locationPrefix: 'string',
        locationType: 'string',
        locationUsage: 'string',
        operationalCapacity: 1,
        parentLocationId: 1,
        userDescription: 'string',
      }

      const result = {
        courtDetails: {
          courtLocation: 'City of London',
        },
        details: {
          name: 'John Doe',
          prison: 'some prison',
          prisonRoom: 'vcc room 1',
        },
        hearingDetails: {
          comments: 'some comment',
          courtHearingEndTime: '19:00',
          courtHearingStartTime: '18:00',
          date: '20 November 2020',
        },
        prePostDetails: {
          'post-court hearing briefing': '19:00 to 19:20',
          'pre-court hearing briefing': '17:40 to 18:00',
        },
        videoBookingId: 123,
      }

      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocation.mockResolvedValue(vccRoom)

      const bookingDetails = await appointmentService.getBookingDetails(context, 123)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 123)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocation).toHaveBeenCalledWith(context, 1)

      expect(bookingDetails).toStrictEqual(result)
    })

    it('should call whereaboutsApi and PrisonApi with the correct videolink booking id when deleting a booking', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)

      await appointmentService.deleteBooking(context, 123)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 123)
      expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)
      expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 123)
    })
  })
  describe('delete', () => {
    const offenderIdentifiers = {
      offenderNo: 'A1234AA',
      bookingId: 789,
      offenderName: 'John Doe',
    }

    const offenderDetails = {
      bookingId: 789,
      firstName: 'john',
      lastName: 'doe',
      offenderNo: 'A1234AA',
    } as InmateDetail

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

    it('should return the offender identifiers when deleting a booking', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      expect(appointmentService.deleteBooking(context, 123)).resolves.toStrictEqual(offenderIdentifiers)
    })
  })
})

import AppointmentsService from '../services/appointmentsService'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

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

  it('should call whereaboutsApi with the correct videolink booking id', async () => {
    type Appointment = {
      startTime: string
      endTime: string
      locationId: number
    }
    const videoLinkBooking = {
      agencyId: 'MDI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: 'string', endTime: 'string', locationId: 1 },
      post: { startTime: 'string', endTime: 'string', locationId: 2 },
      pre: { startTime: 'string', endTime: 'string', locationId: 3 },
      videoLinkBookingId: 1234,
    }
    const offenderDetails = {
      activeAlertCount: 0,
      activeFlag: false,
      age: 0,
      agencyId: 'string',
      alerts: [],
      alertsCodes: [],
      aliases: [],
      assessments: [],
      assignedLivingUnit: {},
      assignedLivingUnitId: 0,
      birthCountryCode: 'GBR',
      birthPlace: 'WALES',
      bookingId: 1000,
      bookingNo: 'string',
      category: 'string',
      categoryCode: 'string',
      csra: 'string',
      dateOfBirth: '1970-03-15T00:00:00.000+00:00',
      facialImageId: 0,
      firstName: 'john',
      identifiers: [],
      imprisonmentStatus: 'LIFE',
      inOutStatus: 'IN' as 'IN' | 'OUT',
      inactiveAlertCount: 0,
      interpreterRequired: false,
      language: 'string',
      lastName: 'doe',
      legalStatus: 'REMAND' as
        | 'REMAND'
        | 'CIVIL_PRISONER'
        | 'CONVICTED_UNSENTENCED'
        | 'DEAD'
        | 'IMMIGRATION_DETAINEE'
        | 'INDETERMINATE_SENTENCE'
        | 'OTHER'
        | 'RECALL'
        | 'SENTENCED'
        | 'UNKNOWN',
      locationDescription: 'Outside - released from Leeds',
      middleName: 'string',
      offenceHistory: [],
      offenderId: 0,
      offenderNo: 'A1234AA',
      personalCareNeeds: [],
      physicalAttributes: {},
      physicalCharacteristics: [],
      physicalMarks: [],
      privilegeSummary: {},
      profileInformation: [],
      recall: true,
      receptionDate: '1980-01-01T00:00:00.000+00:00',
      religion: 'string',
      rootOffenderId: 0,
      sentenceDetail: {},
      sentenceTerms: [],
      status: 'ACTIVE IN' as 'ACTIVE IN' | 'ACTIVE OUT',
      writtenLanguage: 'string',
    }

    whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
    prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
    await appointmentService.deleteBooking(context, 123)
    expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 123)
    expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)


    
    whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
    prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
    // appointmentService.getOffenderIdentifiers.mockResolvedValue(offenderIdentifiers)
    await appointmentService.deleteBooking(context, videoLinkBooking.videoLinkBookingId)

    expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(res.locals, 123)
    expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(res.locals, 123)
    expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(res.locals, videoLinkBooking.bookingId)
    expect(appointmentService.deleteBooking).toHaveReturned({
      offenderNo: offenderDetails.offenderNo,
      bookingId: offenderDetails.bookingId,
      offenderName: 'john doe',
    })
  })
})

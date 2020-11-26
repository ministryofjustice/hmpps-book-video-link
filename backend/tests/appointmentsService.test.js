const { appointmentsServiceFactory } = require('../services/appointmentsService')

describe('Appointments service', () => {
  const prisonApi = {}
  const whereaboutsApi = {}
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities' }]
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
  let res = {}

  beforeEach(() => {
    prisonApi.getLocationsForAppointments = jest.fn()
    prisonApi.getAppointmentTypes = jest.fn()
    whereaboutsApi.createVideoLinkBooking = jest.fn()
    appointmentService = appointmentsServiceFactory(prisonApi, whereaboutsApi)
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
    prisonApi.getLocationsForAppointments.mockReturnValue(locationTypes)
    prisonApi.getAppointmentTypes.mockReturnValue(appointmentTypes)

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
})

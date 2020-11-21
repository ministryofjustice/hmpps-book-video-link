const { appointmentsServiceFactory } = require('../services/appointmentsService')

describe('Appointments service', () => {
  const prisonApi = {}
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

  let service

  beforeEach(() => {
    prisonApi.getLocationsForAppointments = jest.fn()
    prisonApi.getAppointmentTypes = jest.fn()

    service = appointmentsServiceFactory(prisonApi)
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getAppointmentOptions(context, agency)

    expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
    expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    prisonApi.getLocationsForAppointments.mockReturnValue(locationTypes)
    prisonApi.getAppointmentTypes.mockReturnValue(appointmentTypes)

    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({
      appointmentTypes: [{ value: 'ACTI', text: 'Activities' }],
      locationTypes: [
        { value: 27187, text: 'Adj' },
        { value: 27188, text: 'RES-MCASU-MCASU' },
      ],
    })
  })

  it('should return the most complete appointment details', () => {
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

    const result = service.createAppointmentRequest(
      appointmentDetails,
      comment,
      prepostAppointments,
      selectMainAppointmentLocation
    )

    expect(result).toStrictEqual({
      bookingId: 1000,
      court: 'City of London',
      comment: 'some comment',
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
})

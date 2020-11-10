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
})

import type { Location } from 'prisonApi'
import ReferenceDataService from './referenceDataService'
import PrisonApi from '../api/prisonApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>

const room = (i, description = `VCC ROOM ${i}`, userDescription = `Vcc Room ${i}`) =>
  ({
    description,
    locationId: i,
    userDescription,
  } as Location)

describe('Reference service', () => {
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities', activeFlag: 'Y' as const, domain: '' }]
  const locations = [room(27187, 'RES-MCASU-MCASU', 'Adj'), room(27188, 'RES-MCASU-MCASU', null)]

  let service: ReferenceDataService

  beforeEach(() => {
    service = new ReferenceDataService(prisonApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get appointment options', () => {
    it('Should make a request for appointment locations and types', async () => {
      await service.getAppointmentOptions(context, agency)

      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
    })

    it('Should handle empty responses from appointment types and locations', async () => {
      const response = await service.getAppointmentOptions(context, agency)

      expect(response).toEqual({})
    })

    it('Should map appointment types and locations correctly', async () => {
      prisonApi.getLocationsForAppointments.mockResolvedValue(locations)
      prisonApi.getAppointmentTypes.mockResolvedValue(appointmentTypes)

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
})

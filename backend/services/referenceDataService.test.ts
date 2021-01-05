import type { Location } from 'prisonApi'
import ReferenceDataService from './referenceDataService'
import PrisonApi from '../api/prisonApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>

const room = (i, description = `VCC ROOM ${i}`, userDescription = `Vcc Room ${i}`, locationType) =>
  ({
    description,
    locationId: i,
    locationType,
    userDescription,
  } as Location)

describe('Reference service', () => {
  const context = {}
  const agency = 'LEI'
  const locations = [room(27187, 'RES-MCASU-MCASU', 'Adj', 'VIDE'), room(27188, 'RES-MCASU-MCASU', null, 'VIDE')]

  let service: ReferenceDataService

  beforeEach(() => {
    service = new ReferenceDataService(prisonApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get rooms', () => {
    it('Should handle no rooms', async () => {
      prisonApi.getLocationsForAppointments.mockResolvedValue([])

      const response = await service.getRooms(context, agency)

      expect(response).toEqual([])
    })

    it('Should map rooms correctly', async () => {
      prisonApi.getLocationsForAppointments.mockResolvedValue(locations)

      const response = await service.getRooms(context, agency)

      expect(response).toEqual([
        { value: 27187, text: 'Adj' },
        { value: 27188, text: 'RES-MCASU-MCASU' },
      ])
    })
  })
})

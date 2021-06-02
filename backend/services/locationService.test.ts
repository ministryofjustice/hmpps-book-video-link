import type { Location, PrisonContactDetail } from 'prisonApi'
import LocationService from './locationService'
import ManageCourtsService from './manageCourtsService'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { app } from '../config'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./manageCourtsService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const manageCourtsService = new ManageCourtsService(null, null) as jest.Mocked<ManageCourtsService>

const room = (i, description = `VCC ROOM ${i}`, userDescription = `Vcc Room ${i}`, locationType) =>
  ({
    description,
    locationId: i,
    locationType,
    userDescription,
  } as Location)

describe('Location service', () => {
  const userId = 'A_USER'
  const context = {}
  const agency = 'LEI'
  const locations = [room(27187, 'RES-MCASU-MCASU', 'Adj', 'VIDE'), room(27188, 'RES-MCASU-MCASU', null, 'VIDE')]
  const prisons = [
    { agencyId: 'WWI', description: 'HMP WANDSWORTH', formattedDescription: 'HMP Wandsworth' },
    { agencyId: 'MDI', description: 'HMP MOORLAND', formattedDescription: 'HMP Moorland' },
  ] as PrisonContactDetail[]

  let service: LocationService

  beforeEach(() => {
    service = new LocationService(prisonApi, whereaboutsApi, manageCourtsService, app.manageCourtsEnabled)
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

  describe('Get matching prison', () => {
    it('Should return matching prison', async () => {
      const prison = { agencyId: 'WWI', description: 'HMP Wandsworth' }
      prisonApi.getAgencies.mockResolvedValue(prisons)

      const response = await service.getMatchingPrison(context, prison.agencyId)

      expect(response).toEqual(prison)
    })
  })

  describe('Get video link enabled prisons', () => {
    it('Should map video link enabled prisons correctly', async () => {
      app.videoLinkEnabledFor = ['WWI']

      prisonApi.getAgencies.mockResolvedValue(prisons)

      const response = await service.getVideoLinkEnabledPrisons(context)

      expect(response).toEqual([{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
    })
  })

  describe('Get video link court locations', () => {
    it('Should map video link court locations correctly when manage courts disabled', async () => {
      app.manageCourtsEnabled = false
      service = new LocationService(prisonApi, whereaboutsApi, manageCourtsService, app.manageCourtsEnabled)
      const courtLocations = { courtLocations: ['London', 'York'] }
      whereaboutsApi.getCourtLocations.mockResolvedValue(courtLocations)
      const response = await service.getVideoLinkEnabledCourts(context, userId)
      expect(response).toEqual([
        { value: 'London', text: 'London' },
        { value: 'York', text: 'York' },
      ])
    })

    it('Should map video link court locations correctly when manage courts enabled', async () => {
      app.manageCourtsEnabled = true
      service = new LocationService(prisonApi, whereaboutsApi, manageCourtsService, app.manageCourtsEnabled)
      const courtLocations = [
        { courtName: 'London County Court', courtId: 'LDNCOU' },
        { courtName: 'York Crown Court', courtId: 'YKCRN' },
      ]
      manageCourtsService.getSelectedCourts.mockResolvedValue(courtLocations)
      const response = await service.getVideoLinkEnabledCourts(context, userId)
      expect(response).toEqual([
        { value: 'LDNCOU', text: 'London County Court' },
        { value: 'YKCRN', text: 'York Crown Court' },
      ])
    })

    it('Should find single matching court from courtId ', async () => {
      app.manageCourtsEnabled = true
      service = new LocationService(prisonApi, whereaboutsApi, manageCourtsService, app.manageCourtsEnabled)
      const courtId = 'LDNCOU'
      const courtLocations = [
        { courtName: 'London County Court', courtId: 'LDNCOU' },
        { courtName: 'York Crown Court', courtId: 'YKCRN' },
      ]
      manageCourtsService.getSelectedCourts.mockResolvedValue(courtLocations)
      const response = await service.getVideoLinkEnabledCourt(context, courtId, userId)
      expect(response).toEqual({ text: 'London County Court', value: 'LDNCOU' })
    })
  })
})

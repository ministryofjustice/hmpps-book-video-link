import type { CourtDto } from 'courtRegister'
import type { PreferencesDTO } from 'userPreferences'

import CourtApi from '../api/courtApi'
import UserCourtPreferencesApi from '../api/userCourtPreferencesApi'
import ManageCourtsService from './manageCourtsService'

jest.mock('../api/courtApi')
jest.mock('../api/userCourtPreferencesApi')

const courtApi = new CourtApi(null) as jest.Mocked<CourtApi>
const userCourtPreferencesApi = new UserCourtPreferencesApi(null) as jest.Mocked<UserCourtPreferencesApi>

const createCourt = (courtId: string, courtName: string): CourtDto => {
  return {
    courtId,
    courtName,
    type: {
      courtType: 'CRN',
      courtName,
    },
    active: true,
  }
}

const createCourtIds = (courtId: string[]): PreferencesDTO => {
  return {
    items: courtId,
  }
}

describe('Manage courts service', () => {
  let service: ManageCourtsService

  beforeEach(() => {
    service = new ManageCourtsService(courtApi, userCourtPreferencesApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get courts', () => {
    const userId = 'A_USER'
    it('Should return nothing when no courts are active', async () => {
      courtApi.getCourts.mockResolvedValue([])

      const result = await service.getCourtsByLetter(userId)

      expect(result).toStrictEqual(new Map())
    })

    it('can handle a single court', async () => {
      courtApi.getCourts.mockResolvedValue([createCourt('1', 'A Court')])

      const result = await service.getCourtsByLetter(userId)

      expect(result).toStrictEqual(new Map(Object.entries({ A: [createCourt('1', 'A Court')] })))
    })

    it('can handle and sort multiple courts under one letter key', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])

      const result = await service.getCourtsByLetter(userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [createCourt('1', 'AA Court'), createCourt('3', 'AB Court'), createCourt('2', 'AC Court')],
          })
        )
      )
    })

    it('can handle and sort multiple courts under multiple letter keys', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
        createCourt('4', 'CC Court'),
        createCourt('5', 'CB Court'),
        createCourt('6', 'BA Court'),
        createCourt('7', 'BB Court'),
        createCourt('8', 'BC Court'),
        createCourt('9', 'CA Court'),
      ])

      const result = await service.getCourtsByLetter(userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [createCourt('1', 'AA Court'), createCourt('3', 'AB Court'), createCourt('2', 'AC Court')],
            B: [createCourt('6', 'BA Court'), createCourt('7', 'BB Court'), createCourt('8', 'BC Court')],
            C: [createCourt('9', 'CA Court'), createCourt('5', 'CB Court'), createCourt('4', 'CC Court')],
          })
        )
      )
    })
  })

  describe('Get user preferred courts', () => {
    const userId = 'A_USER'
    it('Should return nothing when no courts are preferred', async () => {
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue(createCourtIds([]))

      const result = await service.getUserPreferredCourts(userId)

      expect(result).toStrictEqual({ items: [] })
    })

    it('can handle a single preferred court', async () => {
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue(createCourtIds(['AAC']))

      const result = await service.getUserPreferredCourts(userId)

      expect(result).toStrictEqual({ items: ['AAC'] })
    })

    it('can handle multiple preferred courts', async () => {
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue(createCourtIds(['AAC', 'ACC', 'ABC']))

      const result = await service.getUserPreferredCourts(userId)

      expect(result).toStrictEqual({ items: ['AAC', 'ACC', 'ABC'] })
    })
  })

  describe('Update user preferred courts', () => {
    const context = {}
    const userId = 'A_USER'
    it('Should return all preferred courts when updating', async () => {
      userCourtPreferencesApi.putUserPreferredCourts.mockResolvedValue(createCourtIds(['AAC', 'ACC', 'ABC']))

      const result = await service.updateUserPreferredCourts(context, userId, ['AAC', 'ACC', 'ABC'])

      expect(result).toStrictEqual({ items: ['AAC', 'ACC', 'ABC'] })
    })
  })
})

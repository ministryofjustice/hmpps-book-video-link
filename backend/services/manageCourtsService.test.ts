import type { CourtDto } from 'courtRegister'
import type { PreferencesDTO } from 'userPreferences'

import CourtApi from '../api/courtApi'
import UserCourtPreferencesApi from '../api/userCourtPreferencesApi'
import ManageCourtsService from './manageCourtsService'

jest.mock('../api/courtApi')
jest.mock('../api/userCourtPreferencesApi')

const courtApi = new CourtApi(null) as jest.Mocked<CourtApi>
const userCourtPreferencesApi = new UserCourtPreferencesApi(null) as jest.Mocked<UserCourtPreferencesApi>

type UserPreferenceCourts = CourtDto & {
  isSelected: boolean
}

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

const createSeletedCourt = (courtId: string, courtName: string, isSelected?: boolean): UserPreferenceCourts => {
  return {
    ...createCourt(courtId, courtName),
    isSelected,
  }
}

const createCourtIds = (courtId: string[]): PreferencesDTO => {
  return {
    items: courtId,
  }
}

describe('Manage courts service', () => {
  const userId = 'A_USER'
  const context = {}
  let service: ManageCourtsService

  beforeEach(() => {
    service = new ManageCourtsService(courtApi, userCourtPreferencesApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get courts', () => {
    it('Should return nothing when no courts are active', async () => {
      courtApi.getCourts.mockResolvedValue([])

      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(new Map())
    })

    it('can handle a single court', async () => {
      courtApi.getCourts.mockResolvedValue([createCourt('1', 'A Court')])
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: [] })
      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(new Map(Object.entries({ A: [createSeletedCourt('1', 'A Court', false)] })))
    })

    it('can handle and sort multiple courts under one letter key', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])

      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: [] })

      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [
              createSeletedCourt('1', 'AA Court', false),
              createSeletedCourt('3', 'AB Court', false),
              createSeletedCourt('2', 'AC Court', false),
            ],
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

      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: [] })

      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [
              createSeletedCourt('1', 'AA Court', false),
              createSeletedCourt('3', 'AB Court', false),
              createSeletedCourt('2', 'AC Court', false),
            ],
            B: [
              createSeletedCourt('6', 'BA Court', false),
              createSeletedCourt('7', 'BB Court', false),
              createSeletedCourt('8', 'BC Court', false),
            ],
            C: [
              createSeletedCourt('9', 'CA Court', false),
              createSeletedCourt('5', 'CB Court', false),
              createSeletedCourt('4', 'CC Court', false),
            ],
          })
        )
      )
    })
  })

  describe('Get pre selected user preferred courts', () => {
    it('Should return no pre selected courts when none are preferred', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: [] })

      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [
              createSeletedCourt('1', 'AA Court', false),
              createSeletedCourt('3', 'AB Court', false),
              createSeletedCourt('2', 'AC Court', false),
            ],
          })
        )
      )
    })

    it('can handle preferred courts', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: ['1', '3'] })

      const result = await service.getCourtsByLetter(context, userId)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [
              createSeletedCourt('1', 'AA Court', true),
              createSeletedCourt('3', 'AB Court', true),
              createSeletedCourt('2', 'AC Court', false),
            ],
          })
        )
      )
    })
  })

  describe('Get confirmed user preferred courts', () => {
    it('can handle preferred courts', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])
      userCourtPreferencesApi.getUserPreferredCourts.mockResolvedValue({ items: ['1', '3'] })

      const result = await service.getSelectedCourts(context, userId)

      expect(result).toStrictEqual([
        createSeletedCourt('1', 'AA Court', true),
        createSeletedCourt('3', 'AB Court', true),
      ])
    })
  })

  describe('Update user preferred courts', () => {
    it('Should return all preferred courts when updating', async () => {
      userCourtPreferencesApi.putUserPreferredCourts.mockResolvedValue(createCourtIds(['AAC', 'ACC', 'ABC']))

      const result = await service.updateUserPreferredCourts(context, userId, ['AAC', 'ACC', 'ABC'])

      expect(result).toStrictEqual({ items: ['AAC', 'ACC', 'ABC'] })
    })
  })
})

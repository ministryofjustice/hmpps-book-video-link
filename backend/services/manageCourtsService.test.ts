import type { Agency } from 'prisonApi'

import PrisonApi from '../api/prisonApi'
import ManageCourtsService from './manageCourtsService'

jest.mock('../api/prisonApi')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>

const createCourt = (agencyId: string, description: string): Agency => {
  return {
    active: true,
    agencyId,
    agencyType: 'CRT',
    description,
    longDescription: description,
  }
}

describe('Manage courts service', () => {
  const context = {}
  let service: ManageCourtsService

  beforeEach(() => {
    service = new ManageCourtsService(prisonApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get courts', () => {
    it('Should return nothing when no courts are active', async () => {
      prisonApi.getCourts.mockResolvedValue([])

      const result = await service.getCourtsByLetter(context)

      expect(result).toStrictEqual(new Map())
    })

    it('can handle a single court', async () => {
      prisonApi.getCourts.mockResolvedValue([createCourt('1', 'A Court')])

      const result = await service.getCourtsByLetter(context)

      expect(result).toStrictEqual(new Map(Object.entries({ A: [createCourt('1', 'A Court')] })))
    })

    it('can handle and sort multiple courts under one letter key', async () => {
      prisonApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])

      const result = await service.getCourtsByLetter(context)

      expect(result).toStrictEqual(
        new Map(
          Object.entries({
            A: [createCourt('1', 'AA Court'), createCourt('3', 'AB Court'), createCourt('2', 'AC Court')],
          })
        )
      )
    })

    it('can handle and sort multiple courts under multiple letter keys', async () => {
      prisonApi.getCourts.mockResolvedValue([
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

      const result = await service.getCourtsByLetter(context)

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
})

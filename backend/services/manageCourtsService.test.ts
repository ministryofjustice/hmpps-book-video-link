import type { CourtDto } from 'courtRegister'

import CourtApi from '../api/courtApi'
import ManageCourtsService from './manageCourtsService'

jest.mock('../api/courtApi')

const courtApi = new CourtApi(null) as jest.Mocked<CourtApi>

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

describe('Manage courts service', () => {
  let service: ManageCourtsService

  beforeEach(() => {
    service = new ManageCourtsService(courtApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Get courts', () => {
    it('Should return nothing when no courts are active', async () => {
      courtApi.getCourts.mockResolvedValue([])

      const result = await service.getCourtsByLetter()

      expect(result).toStrictEqual(new Map())
    })

    it('can handle a single court', async () => {
      courtApi.getCourts.mockResolvedValue([createCourt('1', 'A Court')])

      const result = await service.getCourtsByLetter()

      expect(result).toStrictEqual(new Map(Object.entries({ A: [createCourt('1', 'A Court')] })))
    })

    it('can handle and sort multiple courts under one letter key', async () => {
      courtApi.getCourts.mockResolvedValue([
        createCourt('1', 'AA Court'),
        createCourt('2', 'AC Court'),
        createCourt('3', 'AB Court'),
      ])

      const result = await service.getCourtsByLetter()

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

      const result = await service.getCourtsByLetter()

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

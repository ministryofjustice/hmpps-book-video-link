import { PrisonerSchedule } from 'prisonApi'
import PrisonApi from '../api/prisonApi'
import ExistingEventsService from './existingEventsService'
import { Room } from './model'
import ReferenceDataService from './referenceDataService'

jest.mock('../api/prisonApi')
jest.mock('./referenceDataService')

const event = (locationId, startTime, endTime): PrisonerSchedule =>
  ({ locationId, startTime, endTime } as PrisonerSchedule)
const room = (value): Room => ({ text: `room-${value}`, value } as Room)

describe('existing events', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const referenceDataService = new ReferenceDataService(null) as jest.Mocked<ReferenceDataService>
  let service: ExistingEventsService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new ExistingEventsService(prisonApi, referenceDataService)
  })

  describe('location availability', () => {
    it('should adjust the main appointment time by one minute in the future', async () => {
      referenceDataService.getRooms.mockResolvedValue([room(1)])
      prisonApi.getActivityList.mockResolvedValue([event(1, '2019-10-10T10:00:00', '2019-10-10T10:15:00')])

      const availableLocations = await service.getAvailableLocationsForVLB(
        {},
        {
          agencyId: 'LEI',
          startTime: '2019-10-10T10:15',
          endTime: '2019-10-10T10:30',
          date: '2019-10-10',
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        }
      )

      expect(availableLocations).toEqual({
        mainLocations: [room(1)],
        postLocations: [],
        preLocations: [],
      })
    })

    it('simple example', async () => {
      referenceDataService.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      prisonApi.getActivityList
        .mockResolvedValueOnce([event(1, '2019-10-10T10:40:00', '2019-10-10T11:00:00')])
        .mockResolvedValueOnce([event(2, '2019-10-10T11:00:00', '2019-10-10T11:30:00')])
        .mockResolvedValueOnce([event(3, '2019-10-10T11:30:00', '2019-10-10T11:50:00')])

      const availableLocations = await service.getAvailableLocationsForVLB(
        {},
        {
          agencyId: 'LEI',
          startTime: '2019-10-10T11:00',
          endTime: '2019-10-10T11:30',
          date: '2019-10-10',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
        }
      )

      expect(availableLocations).toEqual({
        mainLocations: [room(1)],
        postLocations: [room(1)],
        preLocations: [room(3)],
      })
    })
  })
})

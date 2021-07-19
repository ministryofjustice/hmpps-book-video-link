import moment from 'moment'
import { VideoLinkBookingOptions } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../shared/dateHelpers'
import AvailabilityCheckService from './availabilityCheckService'

jest.mock('../api/whereaboutsApi')

const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

describe('AvailabilityCheckService', () => {
  const context = {}
  let service: AvailabilityCheckService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new AvailabilityCheckService(whereaboutsApi)
  })

  const result: VideoLinkBookingOptions = {
    matched: true,
    alternatives: [
      {
        pre: { locationId: 1, interval: { start: '12:45', end: '13:00' } },
        main: { locationId: 2, interval: { start: '13:00', end: '13:30' } },
        post: { locationId: 3, interval: { start: '13:30', end: '13:45' } },
      },
    ],
  }

  const videoBookingId = 123
  describe('Get availabilty', () => {
    it('call all fields', async () => {
      whereaboutsApi.checkAvailability.mockResolvedValue(result)

      const availability = await service.getAvailability(context, {
        agencyId: 'WWI',
        videoBookingId,
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preLocation: 1,
        mainLocation: 2,
        postLocation: 3,
      })

      expect(availability).toStrictEqual({
        isAvailable: true,
        alternatives: result.alternatives,
        totalInterval: {
          start: '13:45',
          end: '14:45',
        },
      })

      expect(whereaboutsApi.checkAvailability).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdToExclude: 123,
        preAppointment: {
          interval: {
            start: '13:45',
            end: '14:00',
          },
          locationId: 1,
        },
        mainAppointment: {
          interval: {
            start: '14:00',
            end: '14:30',
          },
          locationId: 2,
        },
        postAppointment: {
          interval: {
            start: '14:30',
            end: '14:45',
          },
          locationId: 3,
        },
      })
    })
  })

  it('call optional fields', async () => {
    whereaboutsApi.checkAvailability.mockResolvedValue(result)

    const availability = await service.getAvailability(context, {
      agencyId: 'WWI',
      date: moment('20/11/2020', DAY_MONTH_YEAR),
      startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
      endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
      mainLocation: 2,
    })

    expect(availability).toStrictEqual({
      isAvailable: true,
      alternatives: result.alternatives,
      totalInterval: {
        start: '14:00',
        end: '14:30',
      },
    })

    expect(whereaboutsApi.checkAvailability).toHaveBeenCalledWith(context, {
      agencyId: 'WWI',
      date: '2020-11-20',
      mainAppointment: {
        interval: {
          start: '14:00',
          end: '14:30',
        },
        locationId: 2,
      },
      postAppointment: undefined,
      preAppointment: undefined,
      vlbIdToExclude: undefined,
    })
  })
})

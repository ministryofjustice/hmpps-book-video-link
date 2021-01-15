import moment from 'moment'
import { Location } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../shared/dateHelpers'
import AvailabilityCheckService from './availabilityCheckService'
import { Room } from './model'

jest.mock('../api/whereaboutsApi')

const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

describe('AvailabilityCheckService', () => {
  const context = {}
  let service: AvailabilityCheckService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new AvailabilityCheckService(whereaboutsApi)
  })

  const preInterval = { start: '13:40', end: '14:00' }
  const mainInterval = { start: '14:00', end: '14:30' }
  const postInterval = { start: '14:30', end: '14:50' }

  const room = (value): Room => ({ value, text: `Room-${value}` })

  const location = (locationId): Location => ({
    locationId,
    description: `ROOM-${locationId}`,
    userDescription: `Room-${locationId}`,
  })

  describe('Get available rooms', () => {
    it('All 3 appointments', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue([
        { appointmentInterval: preInterval, locations: [location(1), location(2), location(3)] },
        { appointmentInterval: mainInterval, locations: [location(2), location(3)] },
        { appointmentInterval: postInterval, locations: [location(1)] },
      ])

      const result = await service.getRooms(context, {
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(result).toStrictEqual({
        preLocations: [room(1), room(2), room(3)],
        mainLocations: [room(2), room(3)],
        postLocations: [room(1)],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        appointmentIntervals: [preInterval, mainInterval, postInterval],
      })
    })

    it('Just main appointment', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue([
        { appointmentInterval: mainInterval, locations: [location(2), location(3)] },
      ])

      const result = await service.getRooms(context, {
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: false,
        postRequired: false,
      })

      expect(result).toStrictEqual({ preLocations: [], mainLocations: [room(2), room(3)], postLocations: [] })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        appointmentIntervals: [mainInterval],
      })
    })

    it('Pre and Main appointment', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue([
        { appointmentInterval: preInterval, locations: [location(1), location(2), location(3)] },
        { appointmentInterval: mainInterval, locations: [location(2), location(3)] },
      ])

      const result = await service.getRooms(context, {
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: false,
      })

      expect(result).toStrictEqual({
        preLocations: [room(1), room(2), room(3)],
        mainLocations: [room(2), room(3)],
        postLocations: [],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        appointmentIntervals: [preInterval, mainInterval],
      })
    })

    it('Post and Main appointment', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue([
        { appointmentInterval: mainInterval, locations: [location(2), location(3)] },
        { appointmentInterval: postInterval, locations: [location(1)] },
      ])

      const result = await service.getRooms(context, {
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: false,
        postRequired: true,
      })

      expect(result).toStrictEqual({
        preLocations: [],
        mainLocations: [room(2), room(3)],
        postLocations: [room(1)],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        appointmentIntervals: [mainInterval, postInterval],
      })
    })
  })

  describe('is available', () => {
    const request = {
      agencyId: 'WWI',
      date: moment('20/11/2020', DAY_MONTH_YEAR),
      startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
      endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
      preRequired: false,
      postRequired: false,
    }

    describe('Main appointment only', () => {
      test('no room - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([{ appointmentInterval: mainInterval, locations: [] }])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: false })
        ).resolves.toBe(false)
      })

      test('one room - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: false })
        ).resolves.toBe(true)
      })

      test('two rooms - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(1), location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: false })
        ).resolves.toBe(true)
      })
    })

    describe('Main and pre appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [] },
          { appointmentInterval: mainInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [] },
          { appointmentInterval: mainInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
          { appointmentInterval: mainInterval, locations: [location(1), location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
          { appointmentInterval: mainInterval, locations: [location(3), location(4)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })
    })

    describe('Main and pre appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [] },
          { appointmentInterval: mainInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [] },
          { appointmentInterval: mainInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
          { appointmentInterval: mainInterval, locations: [location(1), location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
          { appointmentInterval: mainInterval, locations: [location(3), location(4)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: true, postRequired: false })
        ).resolves.toBe(true)
      })
    })

    describe('Main and post appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [] },
          { appointmentInterval: postInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [] },
          { appointmentInterval: postInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(1)] },
          { appointmentInterval: postInterval, locations: [] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(2)] },
          { appointmentInterval: postInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(1)] },
          { appointmentInterval: postInterval, locations: [location(1)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(1), location(2)] },
          { appointmentInterval: postInterval, locations: [location(1), location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: mainInterval, locations: [location(3), location(4)] },
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
        ])

        await expect(
          service.isAvailable(context, { ...request, preRequired: false, postRequired: true })
        ).resolves.toBe(true)
      })
    })

    describe('Main, pre and post appointments only', () => {
      test('No rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [] },
          { appointmentInterval: mainInterval, locations: [] },
          { appointmentInterval: postInterval, locations: [] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          false
        )
      })

      test('single rooms - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
          { appointmentInterval: postInterval, locations: [location(3)] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          true
        )
      })

      test('Share room for pre and post - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
          { appointmentInterval: postInterval, locations: [location(1)] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          true
        )
      })

      test('Share room for main and pre - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(2)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
          { appointmentInterval: postInterval, locations: [location(1)] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          false
        )
      })

      test('Share room for main and post - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1)] },
          { appointmentInterval: mainInterval, locations: [location(2)] },
          { appointmentInterval: postInterval, locations: [location(2)] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          false
        )
      })

      test('2 rooms available all the time - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue([
          { appointmentInterval: preInterval, locations: [location(1), location(2)] },
          { appointmentInterval: mainInterval, locations: [location(1), location(2)] },
          { appointmentInterval: postInterval, locations: [location(1), location(2)] },
        ])

        await expect(service.isAvailable(context, { ...request, preRequired: true, postRequired: true })).resolves.toBe(
          true
        )
      })
    })

    test('Booking is available', () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue([
        { appointmentInterval: preInterval, locations: [location(1), location(2), location(3)] },
        { appointmentInterval: mainInterval, locations: [location(1), location(2), location(3)] },
        { appointmentInterval: postInterval, locations: [location(1), location(2), location(3)] },
      ])

      expect(
        service.isAvailable(context, {
          agencyId: 'WWI',
          date: moment('20/11/2020', DAY_MONTH_YEAR),
          startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
          endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
          preRequired: true,
          postRequired: true,
        })
      ).resolves.toBe(true)

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        appointmentIntervals: [preInterval, mainInterval, postInterval],
      })
    })
  })
})

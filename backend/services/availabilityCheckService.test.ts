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
    description: `Room-${locationId}`,
  })

  const videoBookingId = 123
  describe('Get available rooms', () => {
    const getAvailableRooms = async params => {
      const availability = await service.getAvailability(context, params)
      return availability.rooms
    }
    it('No rooms', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [],
        main: [],
        post: [],
      })

      const rooms = await getAvailableRooms({
        agencyId: 'WWI',
        videoBookingId,
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(rooms).toStrictEqual({
        pre: [],
        main: [],
        post: [],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [videoBookingId],
        preInterval,
        mainInterval,
        postInterval,
      })
    })

    it('Missing rooms', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: undefined,
        main: [],
        post: null,
      })

      const rooms = await getAvailableRooms({
        agencyId: 'WWI',
        videoBookingId,
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(rooms).toStrictEqual({
        pre: [],
        main: [],
        post: [],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [videoBookingId],
        preInterval,
        mainInterval,
        postInterval,
      })
    })
  })

  describe('Get available rooms when making a new booking rather than amending a previous booking', () => {
    const getAvailableRooms = async params => {
      const availability = await service.getAvailability(context, params)
      return availability.rooms
    }
    it('No rooms', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [],
        main: [],
        post: [],
      })

      const rooms = await getAvailableRooms({
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(rooms).toStrictEqual({
        pre: [],
        main: [],
        post: [],
      })
    })

    it('All 3 appointments', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [location(1), location(2), location(3)],
        main: [location(2), location(3)],
        post: [location(1)],
      })

      const rooms = await getAvailableRooms({
        agencyId: 'WWI',
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(rooms).toStrictEqual({
        pre: [room(1), room(2), room(3)],
        main: [room(2), room(3)],
        post: [room(1)],
      })

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [],
        preInterval,
        mainInterval,
        postInterval,
      })
    })
  })

  describe('is available', () => {
    const request = {
      agencyId: 'WWI',
      videoBookingId,
      date: moment('20/11/2020', DAY_MONTH_YEAR),
      startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
      endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
      preRequired: false,
      postRequired: false,
    }

    const isAvailable = async params => {
      const availability = await service.getAvailability(context, params)
      return availability.isAvailable
    }

    describe('Main appointment only', () => {
      test('no room - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({ pre: [], main: [], post: [] })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: false })).resolves.toBe(false)
      })

      test('one room - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: false })).resolves.toBe(true)
      })

      test('two rooms - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1), location(2)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: false })).resolves.toBe(true)
      })
    })

    describe('Main and pre appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(2)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(1), location(2)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(3), location(4)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })
    })

    describe('Main and pre appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(2)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(1), location(2)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(3), location(4)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: false })).resolves.toBe(true)
      })
    })

    describe('Main and post appointments only', () => {
      test('no rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(false)
      })

      test('no main rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [],
          post: [location(1)],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(false)
      })

      test('no pre rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(false)
      })

      test('single distinct room for each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(2)],
          post: [location(1)],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(true)
      })

      test('single same room for each - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1)],
          post: [location(1)],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(false)
      })

      test('Same set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(1), location(2)],
          post: [location(1), location(2)],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(true)
      })

      test('Distinct set of available rooms each - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [location(3), location(4)],
          post: [location(1), location(2)],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(true)
      })

      test('Distinct set of available rooms but for pre and main not post - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(3), location(4)],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: false, postRequired: true })).resolves.toBe(false)
      })
    })

    describe('Main, pre and post appointments only', () => {
      test('No rooms - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [],
          main: [],
          post: [],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(false)
      })

      test('single rooms - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(2)],
          post: [location(3)],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(true)
      })

      test('Share room for pre and post - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(2)],
          post: [location(1)],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(true)
      })

      test('Share room for main and pre - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(2)],
          main: [location(2)],
          post: [location(1)],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(false)
      })

      test('Share room for main and post - not available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1)],
          main: [location(2)],
          post: [location(2)],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(false)
      })

      test('2 rooms available all the time - available', async () => {
        whereaboutsApi.getAvailableRooms.mockResolvedValue({
          pre: [location(1), location(2)],
          main: [location(1), location(2)],
          post: [location(1), location(2)],
        })

        await expect(isAvailable({ ...request, preRequired: true, postRequired: true })).resolves.toBe(true)
      })
    })

    test('Booking is available', async () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [location(1), location(2), location(3)],
        main: [location(1), location(2), location(3)],
        post: [location(1), location(2), location(3)],
      })

      const result = await service.getAvailability(context, {
        agencyId: 'WWI',
        videoBookingId,
        date: moment('20/11/2020', DAY_MONTH_YEAR),
        startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
        endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
        preRequired: true,
        postRequired: true,
      })

      expect(result.isAvailable).toBe(true)

      expect(whereaboutsApi.getAvailableRooms).toHaveBeenCalledWith(context, {
        agencyId: 'WWI',
        date: '2020-11-20',
        vlbIdsToExclude: [videoBookingId],
        preInterval,
        mainInterval,
        postInterval,
      })
    })
  })
  describe('Check total interval', () => {
    beforeEach(() => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [],
        main: [],
        post: [],
      })
    })

    const getInterval = async params => {
      const availability = await service.getAvailability(context, params)
      return availability.totalInterval
    }

    test('main only', async () => {
      await expect(
        getInterval({
          agencyId: 'WWI',
          date: moment('20/11/2020', DAY_MONTH_YEAR),
          startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
          endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
          preRequired: false,
          postRequired: false,
        })
      ).resolves.toStrictEqual({ start: '14:00', end: '14:30' })
    })

    test('main and pre', async () => {
      await expect(
        getInterval({
          agencyId: 'WWI',
          date: moment('20/11/2020', DAY_MONTH_YEAR),
          startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
          endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
          preRequired: true,
          postRequired: false,
        })
      ).resolves.toStrictEqual({ start: '13:40', end: '14:30' })
    })

    test('main and post', async () => {
      await expect(
        getInterval({
          agencyId: 'WWI',
          date: moment('20/11/2020', DAY_MONTH_YEAR),
          startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
          endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
          preRequired: false,
          postRequired: true,
        })
      ).resolves.toStrictEqual({ start: '14:00', end: '14:50' })
    })

    test('pre, main and post', async () => {
      await expect(
        getInterval({
          agencyId: 'WWI',
          date: moment('20/11/2020', DAY_MONTH_YEAR),
          startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
          endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
          preRequired: true,
          postRequired: true,
        })
      ).resolves.toStrictEqual({ start: '13:40', end: '14:50' })
    })
  })

  describe('check is still available', () => {
    it('is still available when all still available', async () => {
      expect(
        service.isStillAvailable({ pre: 1, main: 2, post: 3 }, { pre: [room(1)], main: [room(2)], post: [room(3)] })
      ).toBe(true)
    })

    it('is no longer available when pre is no longer available', async () => {
      expect(
        service.isStillAvailable({ pre: 1, main: 2, post: 3 }, { pre: [room(10)], main: [room(2)], post: [room(3)] })
      ).toBe(false)
    })

    it('is no longer available when main is no longer available', async () => {
      expect(
        service.isStillAvailable({ pre: 1, main: 2, post: 3 }, { pre: [room(1)], main: [room(20)], post: [room(3)] })
      ).toBe(false)
    })

    it('should render no rooms are available page when no post are available', async () => {
      expect(
        service.isStillAvailable({ pre: 1, main: 2, post: 3 }, { pre: [room(1)], main: [room(2)], post: [room(30)] })
      ).toBe(false)
    })
  })

  describe('check get status', () => {
    const request = {
      agencyId: 'WWI',
      videoBookingId,
      date: moment('20/11/2020', DAY_MONTH_YEAR),
      startTime: moment('2020-11-20T14:00:00', DATE_TIME_FORMAT_SPEC),
      endTime: moment('2020-11-20T14:30:00', DATE_TIME_FORMAT_SPEC),
      preRequired: true,
      postRequired: true,
    }

    it('AVAILABLE', () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [location(1)],
        main: [location(2)],
        post: [location(3)],
      })

      return expect(service.getAvailabilityStatus({}, request, { pre: 1, main: 2, post: 3 })).resolves.toEqual(
        'AVAILABLE'
      )
    })

    it('NO_LONGER_AVAILABLE', () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [location(1)],
        main: [location(4)],
        post: [location(3)],
      })

      return expect(service.getAvailabilityStatus({}, request, { pre: 1, main: 2, post: 3 })).resolves.toEqual(
        'NO_LONGER_AVAILABLE'
      )
    })

    it('NOT_AVAILABLE', () => {
      whereaboutsApi.getAvailableRooms.mockResolvedValue({
        pre: [location(1)],
        main: [location(2)],
        post: [],
      })

      return expect(service.getAvailabilityStatus({}, request, { pre: 1, main: 2, post: 3 })).resolves.toEqual(
        'NOT_AVAILABLE'
      )
    })
  })
})

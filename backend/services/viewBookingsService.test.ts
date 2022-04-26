import moment from 'moment'
import type { Location, Prison } from 'prisonApi'
import type { VideoLinkBooking } from 'whereaboutsApi'
import type { Prisoner } from 'prisonerOffenderSearchApi'

import config from '../config'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import ViewBookingsService from './viewBookingsService'
import LocationService from './locationService'
import PrisonerOffenderSearchApi from '../api/prisonerOffenderSearchApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('../api/prisonerOffenderSearchApi')
jest.mock('./locationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const prisonerOffenderSearchApi = new PrisonerOffenderSearchApi(null) as jest.Mocked<PrisonerOffenderSearchApi>
const locationService = new LocationService(null, null, null) as jest.Mocked<LocationService>

describe('ViewBookingService', () => {
  let service: ViewBookingsService
  const context = { context: 'some-context' }
  const now = moment()
  const username = 'A_USER'

  const booking = (overrides?: Partial<VideoLinkBooking>): VideoLinkBooking => ({
    agencyId: 'WWI',
    bookingId: 1,
    comment: 'A comment',
    court: 'Westminster Crown Court',
    courtId: 'WMRCN',
    videoLinkBookingId: 10,
    pre: {
      locationId: 100,
      startTime: '2020-12-23T09:40:00',
      endTime: '2020-12-23T10:00:00',
    },
    main: {
      locationId: 110,
      startTime: '2020-12-23T10:00:00',
      endTime: '2020-12-23T10:30:00',
    },
    post: {
      locationId: 120,
      startTime: '2020-12-23T10:30:00',
      endTime: '2020-12-23T10:50:00',
    },
    ...overrides,
  })

  beforeEach(() => {
    jest.resetAllMocks()
    whereaboutsApi.getVideoLinkBookings.mockResolvedValue([])
    prisonApi.getAgencies.mockResolvedValue([])
    whereaboutsApi.getRooms.mockResolvedValue([])
    service = new ViewBookingsService(prisonApi, whereaboutsApi, prisonerOffenderSearchApi, locationService)
    config.app.videoLinkEnabledFor = ['WWI', 'MDI']
  })

  describe('Get List', () => {
    const preAppointmentWWI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:00:00',
      hearingType: 'PRE',
      locationId: 100,
      offenderName: 'Bob Smith',
      prison: 'Wandsworth (HMP)',
      prisonLocation: 'Room 1',
      startTime: '2020-12-23T09:40:00',
      time: '09:40 to 10:00',
      videoLinkBookingId: 10,
    }
    const preAppointmentMDI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:00:00',
      hearingType: 'PRE',
      locationId: 100,
      offenderName: 'Bob Smith',
      prison: 'Moorland (HMP)',
      prisonLocation: 'Room 1',
      startTime: '2020-12-23T09:40:00',
      time: '09:40 to 10:00',
      videoLinkBookingId: 10,
    }
    const mainAppointmentWWI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:30:00',
      hearingType: 'MAIN',
      locationId: 110,
      offenderName: 'Bob Smith',
      prison: 'Wandsworth (HMP)',
      prisonLocation: 'Room 2',
      startTime: '2020-12-23T10:00:00',
      time: '10:00 to 10:30',
      videoLinkBookingId: 10,
    }
    const mainAppointmentMDI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:30:00',
      hearingType: 'MAIN',
      locationId: 110,
      offenderName: 'Bob Smith',
      prison: 'Moorland (HMP)',
      prisonLocation: 'Room 2',
      startTime: '2020-12-23T10:00:00',
      time: '10:00 to 10:30',
      videoLinkBookingId: 10,
    }
    const postAppointmentWWI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:50:00',
      hearingType: 'POST',
      locationId: 120,
      offenderName: 'Bob Smith',
      prison: 'Wandsworth (HMP)',
      prisonLocation: 'Room 3',
      startTime: '2020-12-23T10:30:00',
      time: '10:30 to 10:50',
      videoLinkBookingId: 10,
    }
    const postAppointmentMDI = {
      court: 'Westminster Crown Court',
      endTime: '2020-12-23T10:50:00',
      hearingType: 'POST',
      locationId: 120,
      offenderName: 'Bob Smith',
      prison: 'Moorland (HMP)',
      prisonLocation: 'Room 3',
      startTime: '2020-12-23T10:30:00',
      time: '10:30 to 10:50',
      videoLinkBookingId: 10,
    }

    const courts = [
      { name: 'Westminster Crown Court', id: 'WMRCN' },
      { name: 'Wimbledon County Court', id: 'WLDCOU' },
    ]

    beforeEach(() => {
      prisonerOffenderSearchApi.getPrisoners.mockResolvedValue([
        { bookingId: '1', firstName: 'BOB', lastName: 'SMITH' } as Prisoner,
      ])
      whereaboutsApi.getRooms.mockResolvedValue([
        { locationId: 100, description: 'Room 1' },
        { locationId: 110, description: 'Room 2' },
        { locationId: 120, description: 'Room 3' },
      ] as Location[])
      prisonApi.getAgencies.mockResolvedValue([
        { agencyId: 'WWI', formattedDescription: 'Wandsworth (HMP)' },
        { agencyId: 'MDI', formattedDescription: 'Moorland (HMP)' },
      ] as Prison[])

      locationService.getVideoLinkEnabledCourts.mockResolvedValue(courts)
    })

    it('A booking is turned into appointments', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([booking()])

      const result = await service.getList(context, now, null, username)

      expect(result).toStrictEqual({
        appointments: [preAppointmentWWI, mainAppointmentWWI, postAppointmentWWI],
        courts,
      })
    })

    it('APIs are called correctly', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValue([
        booking({ bookingId: 1 }),
        booking({ bookingId: 2 }),
        booking({ bookingId: 1 }),
      ])

      await service.getList(context, now, 'WMRCN', username)

      expect(locationService.getVideoLinkEnabledCourts).toHaveBeenCalledWith(context, username)
      expect(prisonerOffenderSearchApi.getPrisoners).toHaveBeenCalledWith(context, [1, 2])
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'WWI')
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'MDI')
      expect(whereaboutsApi.getVideoLinkBookings).toHaveBeenCalledWith(context, 'WWI', now, 'WMRCN')
      expect(whereaboutsApi.getVideoLinkBookings).toHaveBeenCalledWith(context, 'MDI', now, 'WMRCN')
    })

    it('Check APIs are called correctly when no bookings', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValue([])

      await service.getList(context, now, 'WMRCN', username)

      expect(locationService.getVideoLinkEnabledCourts).toHaveBeenCalledWith(context, username)
      expect(prisonerOffenderSearchApi.getPrisoners).not.toHaveBeenCalled()
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'WWI')
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'MDI')
      expect(whereaboutsApi.getVideoLinkBookings).toHaveBeenCalledWith(context, 'MDI', now, 'WMRCN')
    })

    it('multiple bookings', async () => {
      whereaboutsApi.getVideoLinkBookings
        .mockResolvedValueOnce([booking({ agencyId: 'WWI' })])
        .mockResolvedValueOnce([booking({ agencyId: 'MDI' })])

      const result = await service.getList(context, now, 'WMRCN', username)

      expect(result).toStrictEqual({
        appointments: [
          preAppointmentWWI,
          preAppointmentMDI,
          mainAppointmentWWI,
          mainAppointmentMDI,
          postAppointmentWWI,
          postAppointmentMDI,
        ],
        courts,
      })
    })

    it('prisoner not found', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([booking({ bookingId: 2 })])

      const result = await service.getList(context, now, 'WMRCN', username)

      expect(result).toStrictEqual({
        appointments: [
          { ...preAppointmentWWI, offenderName: '' },
          { ...mainAppointmentWWI, offenderName: '' },
          { ...postAppointmentWWI, offenderName: '' },
        ],
        courts,
      })
    })
  })
})

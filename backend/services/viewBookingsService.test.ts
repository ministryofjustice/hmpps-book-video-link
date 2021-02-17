import moment from 'moment'
import type { Location, Prison } from 'prisonApi'
import type { VideoLinkBooking } from 'whereaboutsApi'
import type { Prisoner } from 'prisonerOffenderSearchApi'

import config from '../config'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import ViewBookingsService from './viewBookingsService'
import PrisonerOffenderSearchApi from '../api/prisonerOffenderSearchApi'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('../api/prisonerOffenderSearchApi')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const prisonerOffenderSearchApi = new PrisonerOffenderSearchApi(null) as jest.Mocked<PrisonerOffenderSearchApi>

describe('Add court appointment', () => {
  let viewBookingsService: ViewBookingsService
  const context = { context: 'some-context' }
  const now = moment()

  const booking = (overrides?: Partial<VideoLinkBooking>): VideoLinkBooking => ({
    agencyId: 'WWI',
    bookingId: 1,
    comment: 'A comment',
    court: 'Westminster',
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
    prisonApi.getLocationsForAppointments.mockResolvedValue([])
    viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi, prisonerOffenderSearchApi)
    config.app.videoLinkEnabledFor = ['WWI', 'MDI']
  })

  it('courts are returned', async () => {
    whereaboutsApi.getCourtLocations.mockResolvedValue({ courtLocations: ['Westminster', 'Southwark'] })

    const result = await viewBookingsService.getList(context, now, null)

    expect(result).toStrictEqual({ appointments: [], courts: ['Westminster', 'Southwark'] })
    expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(context)
  })

  describe('Creating bookings', () => {
    const preAppointment = {
      court: 'Westminster',
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
    const mainAppointment = {
      court: 'Westminster',
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
    const postAppointment = {
      court: 'Westminster',
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

    beforeEach(() => {
      prisonerOffenderSearchApi.getPrisoners.mockResolvedValue([
        { bookingId: '1', firstName: 'BOB', lastName: 'SMITH' } as Prisoner,
      ])
      prisonApi.getLocationsForAppointments.mockResolvedValue([
        { locationId: 100, userDescription: 'Room 1', agencyId: 'WWI' },
        { locationId: 110, userDescription: 'Room 2', agencyId: 'WWI' },
        { locationId: 120, userDescription: 'Room 3', agencyId: 'WWI' },
      ] as Location[])
      prisonApi.getAgencies.mockResolvedValue([
        { agencyId: 'WWI', formattedDescription: 'Wandsworth (HMP)' },
        { agencyId: 'MDI', formattedDescription: 'Moorland (HMP)' },
      ] as Prison[])

      whereaboutsApi.getCourtLocations.mockResolvedValue({ courtLocations: ['Westminster', 'Southwark'] })
    })

    it('A booking is turned into appointments', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([booking()])

      const result = await viewBookingsService.getList(context, now, null)

      expect(result).toStrictEqual({
        appointments: [preAppointment, mainAppointment, postAppointment],
        courts: ['Westminster', 'Southwark'],
      })
    })

    it('APIs are called correctly', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValue([
        booking({ bookingId: 1 }),
        booking({ bookingId: 2 }),
        booking({ bookingId: 1 }),
      ])

      await viewBookingsService.getList(context, now, null)

      expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(context)
      expect(prisonerOffenderSearchApi.getPrisoners).toHaveBeenCalledWith(context, [1, 2])
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'MDI')
    })

    it('Check APIs are called correctly when no bookings', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValue([])

      await viewBookingsService.getList(context, now, null)

      expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(context)
      expect(prisonerOffenderSearchApi.getPrisoners).not.toHaveBeenCalled()
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'MDI')
    })

    it('multiple bookings', async () => {
      whereaboutsApi.getVideoLinkBookings
        .mockResolvedValueOnce([booking({ agencyId: 'WWI' })])
        .mockResolvedValueOnce([booking({ agencyId: 'MDI' })])

      const result = await viewBookingsService.getList(context, now, null)

      expect(result).toStrictEqual({
        appointments: [
          preAppointment,
          preAppointment,
          mainAppointment,
          mainAppointment,
          postAppointment,
          postAppointment,
        ],
        courts: ['Westminster', 'Southwark'],
      })
    })

    it('Can filter by court', async () => {
      whereaboutsApi.getVideoLinkBookings
        .mockResolvedValueOnce([booking({ court: 'Westminster' })])
        .mockResolvedValueOnce([booking({ court: 'Southwark' })])

      const result = await viewBookingsService.getList(context, now, 'Westminster')

      expect(result).toStrictEqual({
        appointments: [preAppointment, mainAppointment, postAppointment],
        courts: ['Westminster', 'Southwark'],
      })
    })

    it('Other court filter selects any unknown court', async () => {
      const otherCourtName = 'Something else'
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([
        booking({ court: 'Westminster' }),
        booking({ court: 'Southwark' }),
        booking({ court: otherCourtName }),
      ])

      const result = await viewBookingsService.getList(context, now, 'Other')

      expect(result).toStrictEqual({
        appointments: [
          { ...preAppointment, court: otherCourtName },
          { ...mainAppointment, court: otherCourtName },
          { ...postAppointment, court: otherCourtName },
        ],
        courts: ['Westminster', 'Southwark'],
      })
    })

    it('prisoner not found', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([booking({ bookingId: 2 })])

      const result = await viewBookingsService.getList(context, now, null)

      expect(result).toStrictEqual({
        appointments: [
          { ...preAppointment, offenderName: '' },
          { ...mainAppointment, offenderName: '' },
          { ...postAppointment, offenderName: '' },
        ],
        courts: ['Westminster', 'Southwark'],
      })
    })

    it('prison location not found', async () => {
      whereaboutsApi.getVideoLinkBookings.mockResolvedValueOnce([
        booking({
          pre: {
            locationId: 10000,
            startTime: '2020-12-23T09:40:00',
            endTime: '2020-12-23T10:00:00',
          },
        }),
      ])

      const result = await viewBookingsService.getList(context, now, null)

      expect(result).toStrictEqual({
        appointments: [
          { ...preAppointment, locationId: 10000, prison: '', prisonLocation: '' },
          { ...mainAppointment },
          { ...postAppointment },
        ],
        courts: ['Westminster', 'Southwark'],
      })
    })
  })
})

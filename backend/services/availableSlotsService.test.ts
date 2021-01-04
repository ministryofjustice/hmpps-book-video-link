import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'
import AvailableSlotsService from './availableSlotsService'
import ReferenceDataService from './referenceDataService'

jest.mock('./referenceDataService')

const getTime = ({ momentDate = moment(), hour, minutes }) =>
  momentDate.hour(Number(hour)).minute(minutes).seconds(0).millisecond(0)

const getTimeWithFormat = options => getTime(options).format(DATE_TIME_FORMAT_SPEC)

describe('Available slots service', () => {
  const referenceDataService = new ReferenceDataService(null) as jest.Mocked<ReferenceDataService>
  const existingEventsService = { getAppointmentsAtLocations: jest.fn() }
  const openingHours = jest.fn()
  let service: AvailableSlotsService

  beforeEach(() => {
    existingEventsService.getAppointmentsAtLocations = jest.fn()
    service = new AvailableSlotsService(referenceDataService, existingEventsService, openingHours)
  })

  it('should break day up into 30 minute chucks', () => {
    openingHours.mockReturnValue({ startOfDay: 9, endOfDay: 11 })

    const date = moment().format(DATE_ONLY_FORMAT_SPEC)

    const chunks = service.breakDayIntoSlots(date, 30)

    expect(chunks).toEqual([
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 0 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 30 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 9, minutes: 30 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 0 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 0 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 30 }),
      },
      {
        startTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 10, minutes: 30 }),
        endTime: getTime({ momentDate: moment(date, DATE_ONLY_FORMAT_SPEC), hour: 11, minutes: 0 }),
      },
    ])
  })

  it('should return available rooms that match slots', () => {
    const locations = [
      { value: 1, text: 'loc-1' },
      { value: 2, text: 'loc-2' },
    ]
    const timeSlots = [
      { startTime: getTime({ hour: 9, minutes: 0 }), endTime: getTime({ hour: 10, minutes: 0 }) },
      { startTime: getTime({ hour: 10, minutes: 0 }), endTime: getTime({ hour: 11, minutes: 0 }) },
    ]
    const eventsAtLocations = [
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 9, minutes: 0 }),
        end: getTimeWithFormat({ hour: 17, minutes: 0 }),
      },
    ]

    openingHours.mockReturnValue({ startOfDay: 9, endOfDay: 11 })

    const availableRooms = service.getAvailableLocationsForSlots(timeSlots, locations, eventsAtLocations)
    expect(availableRooms).toEqual([{ value: 2, text: 'loc-2' }])
  })

  it('should return no available rooms', async () => {
    referenceDataService.getVideoLinkLocations.mockResolvedValue([{ value: 1, text: 'Location-1' }])
    existingEventsService.getAppointmentsAtLocations.mockReturnValue([
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 9, minutes: 0 }),
        end: getTimeWithFormat({ hour: 17, minutes: 0 }),
      },
    ])

    openingHours.mockReturnValue({ startOfDay: 9, endOfDay: 17 })

    const startTime = getTimeWithFormat({ hour: 9, minutes: 0 })
    const endTime = getTimeWithFormat({ hour: 11, minutes: 0 })
    const availableRooms = await service.getAvailableRooms({}, { agencyId: 'LEI', startTime, endTime })

    expect(availableRooms).toEqual([])
  })

  it('should return a two locations, one of each id', async () => {
    referenceDataService.getVideoLinkLocations.mockResolvedValue([
      { value: 1, text: 'Location-1' },
      { value: 2, text: 'Location-2' },
    ])
    existingEventsService.getAppointmentsAtLocations.mockReturnValue([
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 9, minutes: 0 }),
        end: getTimeWithFormat({ hour: 10, minutes: 0 }),
      },
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 10, minutes: 0 }),
        end: getTimeWithFormat({ hour: 11, minutes: 0 }),
      },
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 11, minutes: 0 }),
        end: getTimeWithFormat({ hour: 12, minutes: 0 }),
      },
      {
        locationId: 1,
        start: getTimeWithFormat({ hour: 12, minutes: 0 }),
        end: getTimeWithFormat({ hour: 13, minutes: 0 }),
      },
    ])

    openingHours.mockReturnValue({ startOfDay: 9, endOfDay: 15 })

    const startTime = getTimeWithFormat({ hour: 9, minutes: 0 })
    const endTime = getTimeWithFormat({ hour: 10, minutes: 0 })
    const availableRooms = await service.getAvailableRooms({}, { agencyId: 'LEI', startTime, endTime })

    expect(availableRooms).toEqual([
      { value: 2, text: 'Location-2' },
      { value: 1, text: 'Location-1' },
    ])
  })
})

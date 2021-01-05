import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'
import { Room } from './model'
import ReferenceDataService from './referenceDataService'

type TimeSlot = {
  startTime: moment.Moment
  endTime: moment.Moment
}

type OpeningHours = () => {
  startOfDay: number
  endOfDay: number
}

const defaultOpeningHours: OpeningHours = () => ({
  startOfDay: 8,
  endOfDay: 18,
})

const getDiffInMinutes = (startTime, endTime) => moment.duration(endTime.diff(startTime)).asMinutes()

const sortByStartTime = (a, b) => a.startTime.diff(b.startTime)

export default class AvailableSlotService {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly existingEventsService,
    private readonly openingHours = defaultOpeningHours
  ) {}

  public breakDayIntoSlots(date: string, slotDuration: number): TimeSlot[] {
    const { startOfDay, endOfDay } = this.openingHours()
    const startTime = moment(date, DATE_ONLY_FORMAT_SPEC).hour(startOfDay).minute(0).seconds(0).millisecond(0)

    const endTime = moment(date, DATE_ONLY_FORMAT_SPEC).hour(endOfDay).minute(0).seconds(0).millisecond(0)

    const duration = moment.duration(endTime.diff(startTime))
    const totalMinutes = duration.asMinutes()

    const numberOfSlots = Math.floor(totalMinutes / slotDuration)

    return [...Array(numberOfSlots).keys()]
      .map(index => {
        const start = moment(startTime).add(index * slotDuration, 'minute')
        const end = moment(start).add(slotDuration, 'minute')

        return {
          startTime: start,
          endTime: end,
        }
      })
      .sort(sortByStartTime)
  }

  public getAvailableLocationsForSlots(timeSlots: TimeSlot[], locations: Room[], eventsAtLocations): Room[] {
    return [
      ...new Set(
        timeSlots.flatMap(timeSlot => {
          const requestedStartTime = moment(timeSlot.startTime, DATE_TIME_FORMAT_SPEC)
          const requestedEndTime = moment(timeSlot.endTime, DATE_TIME_FORMAT_SPEC)

          const findOverlappingSlots = slots =>
            slots.filter(bookedSlot => {
              const bookedStartTime = moment(bookedSlot.start, DATE_TIME_FORMAT_SPEC)
              const bookedEndTime = moment(bookedSlot.end, DATE_TIME_FORMAT_SPEC)

              return (
                moment(bookedStartTime).isSameOrBefore(requestedEndTime, 'minute') &&
                moment(requestedStartTime).isSameOrBefore(bookedEndTime, 'minute')
              )
            })

          const fullyBookedLocations = locations.filter(location => {
            const slots = eventsAtLocations.filter(locationEvent => locationEvent.locationId === location.value)
            return findOverlappingSlots(slots).length > 0
          })

          return locations.filter(location => !fullyBookedLocations.includes(location))
        })
      ),
    ]
  }

  public async getAvailableRooms(context, { agencyId, startTime, endTime }) {
    const date = moment(startTime, DATE_TIME_FORMAT_SPEC)

    const locations = await this.referenceDataService.getRooms(context, agencyId)
    const eventsAtLocations = await this.existingEventsService.getAppointmentsAtLocations(context, {
      agency: agencyId,
      date: date.format(DAY_MONTH_YEAR),
      locations,
    })

    const minutesNeeded = getDiffInMinutes(
      moment(startTime, DATE_TIME_FORMAT_SPEC),
      moment(endTime, DATE_TIME_FORMAT_SPEC)
    )

    const timeSlots = this.breakDayIntoSlots(date.format(DATE_ONLY_FORMAT_SPEC), minutesNeeded)

    return this.getAvailableLocationsForSlots(timeSlots, locations, eventsAtLocations)
  }
}

import moment from 'moment'
import { PrisonerSchedule } from 'prisonApi'
import PrisonApi from '../api/prisonApi'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'
import { switchDateFormat, flattenCalls } from '../utils'
import { Context, Room } from './model'
import ReferenceDataService from './referenceDataService'

export type Appointment = {
  locationId: number
  start: string
  end: string
}

type TimeSlot = {
  startTime: string
  endTime: string
}

type RoomAvailability = { mainLocations: Room[]; preLocations: Room[]; postLocations: Room[] }

const toAppointment: (PrisonerSchedule, locationId: number) => Appointment = (event, locationId) => ({
  locationId,
  start: event.startTime,
  end: event.endTime,
})

export default class ExistingEventsService {
  constructor(private readonly prisonApi: PrisonApi, private readonly referenceDataService: ReferenceDataService) {}

  private async getAppointmentsAtLocationEnhanceWithLocationId(
    context: Context,
    agency: string,
    locationId: number,
    date: string
  ): Promise<Appointment[]> {
    const response: PrisonerSchedule[] = await this.prisonApi.getActivityList(context, {
      agencyId: agency,
      date: switchDateFormat(date),
      locationId,
      usage: 'APP',
    })

    return response.map(event => toAppointment(event, locationId))
  }

  public async getAppointmentsAtLocations(context: Context, { agency, date, locations }): Promise<Appointment[]> {
    return flattenCalls(
      locations.map(location =>
        this.getAppointmentsAtLocationEnhanceWithLocationId(context, agency, location.value, date)
      )
    )
  }

  private async getAvailableRooms(timeSlot: TimeSlot, locations: Room[], eventsAtLocations: Appointment[]) {
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
  }

  public async getAvailableLocationsForVLB(
    context: Context,
    { agencyId, startTime, endTime, date, preAppointmentRequired, postAppointmentRequired }
  ): Promise<RoomAvailability> {
    const rooms = await this.referenceDataService.getRooms(context, agencyId)

    const appointments = await this.getAppointmentsAtLocations(context, {
      agency: agencyId,
      date,
      locations: rooms,
    })

    const mainStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).add(1, 'minute').format(DATE_TIME_FORMAT_SPEC)
    const mainLocations = await this.getAvailableRooms({ startTime: mainStartTime, endTime }, rooms, appointments)

    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)

    const preLocations =
      preAppointmentRequired === 'yes'
        ? await this.getAvailableRooms({ startTime: preStartTime, endTime: startTime }, rooms, appointments)
        : []

    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)

    const postLocations =
      postAppointmentRequired === 'yes'
        ? await this.getAvailableRooms({ startTime: endTime, endTime: postEndTime }, rooms, appointments)
        : []

    return { mainLocations, preLocations, postLocations }
  }
}

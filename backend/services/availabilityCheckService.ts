import moment, { Moment } from 'moment'
import { AppointmentLocationsSpecification, Interval, Location } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'
import { Context, RoomAvailability, AvailabilityRequest, Room } from './model'

const none = { locations: [] }

type AppointmentRooms = { pre: Room[]; main: Room[]; post: Room[] }

export default class AvailabilityCheckService {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  private createInterval(start: Moment, end: Moment): Interval {
    return { start: start.format('HH:mm'), end: end.format('HH:mm') }
  }

  private locationToRoom(location: Location): Room {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  public async getAvailability(context: Context, request: AvailabilityRequest): Promise<RoomAvailability> {
    const { agencyId, date, startTime, endTime, preRequired, postRequired } = request

    const preStart = moment(startTime).subtract(20, 'minutes')
    const preEnd = startTime

    const postStart = endTime
    const postEnd = moment(endTime).add(20, 'minutes')

    const spec: AppointmentLocationsSpecification = {
      agencyId,
      date: date.format(DATE_ONLY_FORMAT_SPEC),
      vlbIdsToExclude: [],
      appointmentIntervals: [
        ...(preRequired ? [this.createInterval(preStart, preEnd)] : []),
        this.createInterval(startTime, endTime),
        ...(postRequired ? [this.createInterval(postStart, postEnd)] : []),
      ],
    }

    const [one, two, three] = await this.whereaboutsApi.getAvailableRooms(context, spec)
    const rooms = {
      pre: (preRequired ? one : none).locations.map(this.locationToRoom),
      main: (preRequired ? two : one).locations.map(this.locationToRoom),
      post: (postRequired ? three || two : none).locations.map(this.locationToRoom),
    }

    const isAvailable = await this.isAvailable(request, rooms)

    return {
      isAvailable,
      rooms,
      totalInterval: this.createInterval(preRequired ? preStart : startTime, postRequired ? postEnd : endTime),
    }
  }

  private async isAvailable(request: AvailabilityRequest, { pre, main, post }: AppointmentRooms): Promise<boolean> {
    return main
      .map(l => l.value)
      .some(mainRoom => {
        const preSatisfied = !request.preRequired || pre.some(preRoom => preRoom.value !== mainRoom)
        const postSatisfied = !request.postRequired || post.some(postRoom => postRoom.value !== mainRoom)
        return preSatisfied && postSatisfied
      })
  }
}

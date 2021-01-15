import moment, { Moment } from 'moment'
import { AppointmentLocationsSpecification, Interval, Location } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC, DAY_MONTH_YEAR } from '../shared/dateHelpers'
import { Context, RoomAvailability, AvailabilityRequest, Room } from './model'

export default class AvailabilityCheckService {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  private createInterval(start: Moment, end: Moment): Interval {
    return { start: start.format('HH:mm'), end: end.format('HH:mm') }
  }

  private locationToRoom(location: Location): Room {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  private createRequest(agencyId: string, obj): AvailabilityRequest {
    return {
      agencyId,
      date: moment(obj.date, DAY_MONTH_YEAR),
      startTime: moment(obj.startTime),
      endTime: moment(obj.endTime),
      preRequired: obj.preAppointmentRequired === 'yes',
      postRequired: obj.postAppointmentRequired === 'yes',
    }
  }

  public async getRooms(context: Context, request: AvailabilityRequest): Promise<RoomAvailability> {
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

    const none = { locations: [] }

    const [one, two, three] = await this.whereaboutsApi.getAvailableRooms(context, spec)
    return {
      preLocations: (preRequired ? one : none).locations.map(this.locationToRoom),
      mainLocations: (preRequired ? two : one).locations.map(this.locationToRoom),
      postLocations: (postRequired ? three || two : none).locations.map(this.locationToRoom),
    }
  }

  public async isAvailable(context: Context, request: AvailabilityRequest): Promise<boolean> {
    const { preLocations, mainLocations, postLocations } = await this.getRooms(context, request)

    return mainLocations
      .map(l => l.value)
      .some(main => {
        const preSatisfied = !request.preRequired || preLocations.some(pre => pre.value !== main)
        const postSatisfied = !request.postRequired || postLocations.some(post => post.value !== main)
        return preSatisfied && postSatisfied
      })
  }
}

import { Location } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'
import AvailabilityStatusChecker from './availabilityStatusChecker'
import {
  createInterval,
  getPostAppointmentInterval,
  getPreAppointmentInterval,
  getTotalAppointmentInterval,
} from './bookingTimes'
import type {
  Context,
  RoomAvailability,
  AvailabilityRequest,
  Room,
  SelectedRooms,
  Rooms,
  AvailabilityStatus,
} from './model'

export default class AvailabilityCheckServiceV1 implements AvailabilityStatusChecker {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  private locationToRoom(location: Location): Room {
    return { value: location.locationId, text: location.description }
  }

  public async getAvailability(context: Context, request: AvailabilityRequest): Promise<RoomAvailability> {
    const { agencyId, videoBookingId, date, startTime, endTime, preRequired, postRequired } = request

    const { pre, main, post } = await this.whereaboutsApi.getAvailableRooms(context, {
      agencyId,
      date: date.format(DATE_ONLY_FORMAT_SPEC),
      vlbIdsToExclude: videoBookingId ? [videoBookingId] : [],
      preInterval: preRequired ? getPreAppointmentInterval(startTime) : null,
      mainInterval: createInterval([startTime, endTime]),
      postInterval: postRequired ? getPostAppointmentInterval(endTime) : null,
    })

    const rooms = {
      pre: (pre || []).map(this.locationToRoom),
      main: main.map(this.locationToRoom),
      post: (post || []).map(this.locationToRoom),
    }

    const isAvailable = await this.isAvailable(request, rooms)

    return {
      isAvailable,
      rooms,
      totalInterval: getTotalAppointmentInterval(startTime, endTime, preRequired, postRequired),
    }
  }

  private async isAvailable(request: AvailabilityRequest, { pre, main, post }: Rooms): Promise<boolean> {
    return main.length > 0 && (!request.preRequired || pre.length > 0) && (!request.postRequired || post.length > 0)
  }

  private selectedRoomExists(selectedRoom: number, possibleRooms: Room[]): boolean {
    return selectedRoom ? possibleRooms.some(room => room.value === selectedRoom) : true
  }

  public isStillAvailable(selectedRooms: SelectedRooms, rooms: Rooms): boolean {
    return (
      this.selectedRoomExists(selectedRooms.pre, rooms.pre) &&
      this.selectedRoomExists(selectedRooms.main, rooms.main) &&
      this.selectedRoomExists(selectedRooms.post, rooms.post)
    )
  }

  public async getAvailabilityStatus(
    context: Context,
    request: AvailabilityRequest,
    selectedRooms: SelectedRooms
  ): Promise<AvailabilityStatus> {
    const { rooms, isAvailable } = await this.getAvailability(context, request)
    if (!isAvailable) {
      return 'NOT_AVAILABLE'
    }
    return this.isStillAvailable(selectedRooms, rooms) ? 'AVAILABLE' : 'NO_LONGER_AVAILABLE'
  }
}

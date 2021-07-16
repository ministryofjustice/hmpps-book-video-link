import { LocationAndInterval } from 'whereaboutsApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'
import { isNullOrUndefined } from '../utils'
import {
  createInterval,
  getPostAppointmentInterval,
  getPreAppointmentInterval,
  getTotalAppointmentInterval,
} from './bookingTimes'
import type { Context, AvailabilityStatus, AvailabilityRequestV2, RoomAvailabilityV2 } from './model'

export default class AvailabilityCheckServiceV2 {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  private toAppointment = (locationId, interval): LocationAndInterval => ({ locationId, interval })

  public async getAvailability(context: Context, request: AvailabilityRequestV2): Promise<RoomAvailabilityV2> {
    const { agencyId, videoBookingId, date, startTime, endTime, preLocation, mainLocation, postLocation } = request

    const { matched, alternatives } = await this.whereaboutsApi.checkAvailability(context, {
      agencyId,
      date: date.format(DATE_ONLY_FORMAT_SPEC),
      vlbIdToExclude: videoBookingId,
      preAppointment: isNullOrUndefined(preLocation)
        ? undefined
        : this.toAppointment(preLocation, getPreAppointmentInterval(startTime)),
      mainAppointment: this.toAppointment(mainLocation, createInterval([startTime, endTime])),
      postAppointment: isNullOrUndefined(postLocation)
        ? undefined
        : this.toAppointment(postLocation, getPostAppointmentInterval(endTime)),
    })

    return {
      isAvailable: matched,
      alternatives,
      totalInterval: getTotalAppointmentInterval(startTime, endTime, Boolean(preLocation), Boolean(postLocation)),
    }
  }

  public async getAvailabilityStatus(context: Context, request: AvailabilityRequestV2): Promise<AvailabilityStatus> {
    const { isAvailable } = await this.getAvailability(context, request)
    return isAvailable ? 'AVAILABLE' : 'NOT_AVAILABLE'
  }
}

import type { Moment } from 'moment'
import type { Location } from 'prisonApi'
import type PrisonApi from '../api/prisonApi'
import type { Context } from './model'
import { formatTimes } from './bookingTimes'

export class RoomFinder {
  constructor(private readonly locations: Location[]) {}

  public prisonRoom = (locationId: number): string => {
    const location = this.locations.find(loc => loc.locationId === locationId)
    return location?.userDescription || location?.description || ''
  }

  public bookingDescription = (locationId: number, times: [Moment, Moment]): string =>
    `${this.prisonRoom(locationId)} - ${formatTimes(times)}`
}

export type RoomFinderFactory = (context: Context, agencyId: string) => Promise<RoomFinder>

export const roomFinderFactory = (prisonApi: PrisonApi): RoomFinderFactory => async (context, agencyId) => {
  const locations = await prisonApi.getLocationsForAppointments(context, agencyId)
  return new RoomFinder(locations)
}

import type { Moment } from 'moment'
import type { Location } from 'whereaboutsApi'
import type { Context } from './model'
import { formatTimes } from './bookingTimes'
import { WhereaboutsApi } from '../api'

export class RoomFinder {
  constructor(private readonly locations: Location[]) {}

  public prisonRoom = (locationId: number): string => {
    const location = this.locations.find(loc => loc.locationId === locationId)
    return location?.description || undefined
  }

  public bookingDescription = (locationId: number, times: [Moment, Moment]): string =>
    `${this.prisonRoom(locationId)} - ${formatTimes(times)}`

  public allRooms = (): Location[] => this.locations
}

export type RoomFinderFactory = (context: Context, agencyId: string) => Promise<RoomFinder>

export const roomFinderFactory =
  (whereaboutsApi: WhereaboutsApi): RoomFinderFactory =>
  async (context, agencyId) => {
    const locations = await whereaboutsApi.getRooms(context, agencyId)
    return new RoomFinder(locations)
  }

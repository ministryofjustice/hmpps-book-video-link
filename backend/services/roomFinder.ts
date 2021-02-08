import { Moment } from 'moment'
import { Location } from 'prisonApi'
import PrisonApi from '../api/prisonApi'
import { MOMENT_TIME } from '../shared/dateHelpers'
import { Context } from './model'

export class RoomFinder {
  constructor(private readonly locations: Location[]) {}

  public prisonRoom = (locationId: number): string => {
    const location = this.locations.find(loc => loc.locationId === locationId)
    return location?.userDescription || location?.description || ''
  }

  public bookingDescription = (locationId: number, [start, end]: [Moment, Moment]): string =>
    `${this.prisonRoom(locationId)} - ${start.format(MOMENT_TIME)} to ${end.format(MOMENT_TIME)}`
}

export type RoomFinderFactory = (context: Context, agencyId: string) => Promise<RoomFinder>

export const roomFinderFactory = (prisonApi: PrisonApi): RoomFinderFactory => async (context, agencyId) => {
  const locations = await prisonApi.getLocationsForAppointments(context, agencyId)
  return new RoomFinder(locations)
}

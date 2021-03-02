import type PrisonApi from '../api/prisonApi'
import type WhereaboutsApi from '../api/whereaboutsApi'
import { Context, Room, Prison, Court } from './model'
import { app } from '../config'

export = class LocationService {
  constructor(private readonly prisonApi: PrisonApi, private readonly whereaboutsApi: WhereaboutsApi) {}

  private transformRoom(location): Room {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  private transformPrison(prison): Prison {
    return { agencyId: prison.agencyId, description: prison.formattedDescription || prison.description }
  }

  public async getRooms(context: Context, agency: string): Promise<Room[]> {
    const locations = await this.prisonApi.getLocationsForAppointments(context, agency)
    return locations.filter(loc => loc.locationType === 'VIDE').map(this.transformRoom)
  }

  public async getMatchingPrison(context: Context, prison: string): Promise<Prison> {
    const prisons = await this.prisonApi.getAgencies(context)
    const matchingPrison = prisons.filter(p => p.agencyId === prison).map(this.transformPrison)
    return matchingPrison[0]
  }

  public async getVideoLinkEnabledPrisons(context: Context): Promise<Prison[]> {
    const prisons = await this.prisonApi.getAgencies(context)
    return prisons.filter(prison => app.videoLinkEnabledFor.includes(prison.agencyId)).map(this.transformPrison)
  }

  public async getVideoLinkEnabledCourts(context: Context): Promise<Court[]> {
    const { courtLocations } = await this.whereaboutsApi.getCourtLocations(context)
    return courtLocations.map(location => ({
      value: location,
      text: location,
    }))
  }
}

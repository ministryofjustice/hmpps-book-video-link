import type PrisonApi from '../api/prisonApi'
import { Context, Room, Prison } from './model'
import { app } from '../config'

export = class LocationService {
  constructor(private readonly prisonApi: PrisonApi) {}

  private transform(location): Room {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  public async getRooms(context: Context, agency: string): Promise<Room[]> {
    const locations = await this.prisonApi.getLocationsForAppointments(context, agency)
    return locations.filter(loc => loc.locationType === 'VIDE').map(this.transform)
  }

  public async getVideoLinkEnabledPrisons(context: Context): Promise<Prison[]> {
    const prisons = await this.prisonApi.getAgencies(context)

    return prisons
      .filter(prison => app.videoLinkEnabledFor.includes(prison.agencyId))
      .map(vlp => ({
        agencyId: vlp.agencyId,
        description: vlp.formattedDescription || vlp.description,
      }))
  }
}

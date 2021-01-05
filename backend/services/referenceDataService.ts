import type PrisonApi from '../api/prisonApi'
import { Context, Room } from './model'

export = class ReferenceDataService {
  constructor(private readonly prisonApi: PrisonApi) {}

  private transform(location): Room {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  public async getRooms(context: Context, agency: string): Promise<Room[]> {
    const locations = await this.prisonApi.getLocationsForAppointments(context, agency)
    return locations.filter(loc => loc.locationType === 'VIDE').map(this.transform)
  }
}

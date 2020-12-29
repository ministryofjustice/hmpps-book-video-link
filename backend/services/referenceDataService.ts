import type PrisonApi from '../api/prisonApi'
import { Context } from './model'

type Option = {
  value: string
  text: string
}

type AppointmentOptions = {
  locationTypes: Option[]
  appointmentTypes: Option[]
}

export = class ReferenceDataService {
  constructor(private readonly prisonApi: PrisonApi) {}

  private mapLocationType(location): Option {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  private mapAppointmentType(appointment): Option {
    return { value: appointment.code, text: appointment.description }
  }

  public async getVideoLinkLocations(context: Context, agency: string): Promise<Option[]> {
    return (await this.prisonApi.getLocationsForAppointments(context, agency))
      .filter(loc => loc.locationType === 'VIDE')
      .map(this.mapLocationType)
  }

  public async getAppointmentOptions(context: Context, agency: string): Promise<AppointmentOptions> {
    const [locationTypes, appointmentTypes] = await Promise.all([
      this.prisonApi.getLocationsForAppointments(context, agency),
      this.prisonApi.getAppointmentTypes(context),
    ])
    return {
      locationTypes: locationTypes && locationTypes.map(this.mapLocationType),
      appointmentTypes: appointmentTypes && appointmentTypes.map(this.mapAppointmentType),
    }
  }
}

import type prisonApi from 'prisonApi'
import { Response } from 'superagent'
import contextProperties from '../contextProperties'
import { mapToQueryString } from '../utils'
import Client from './oauthEnabledClient'

type Context = any
type Schemas = prisonApi.schemas

type ActivityListRequest = {
  agencyId: string
  locationId: number
  usage: string
  date: string
  timeSlot: 'AM' | 'ED' | 'PM'
}

type AgencyAppointmentRequest = {
  agencyId: string
  locationId?: number
  date: string
  timeSlot?: 'AM' | 'ED' | 'PM'
}

type GlobalSearchRequest = {
  offenderNo: string
  lastName: string
  firstName: string
  gender: 'F' | 'M' | 'NK' | 'NS'
  location: 'IN' | 'OUT' | 'ALL'
  dateOfBirth: string
  includeAliases: boolean
}

export = class PrisonApi {
  constructor(private readonly client: Client) {}

  private processResponse(context: Context): (Response) => any {
    return (response: Response) => {
      contextProperties.setResponsePagination(context, response.headers)
      return response.body
    }
  }

  private get<T>(context: Context, url: string, resultsLimit?: number): Promise<T> {
    return this.client.get(context, url, resultsLimit).then(this.processResponse(context))
  }

  public getPrisonBookings(context: Context, bookingIds: number[]): Promise<Schemas['OffenderBooking'][]> {
    return this.get(context, `/api/bookings?bookingId=${bookingIds}`, 1000)
  }

  public getActivityList(
    context: Context,
    { agencyId, locationId, usage, date, timeSlot }: ActivityListRequest
  ): Promise<Schemas['PrisonerSchedule'][]> {
    return this.get(
      context,
      `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?${
        timeSlot ? `timeSlot=${timeSlot}&` : ''
      }date=${date}`
    )
  }

  public getAppointmentsForAgency = (
    context: Context,
    { agencyId, date, locationId, timeSlot }: AgencyAppointmentRequest
  ): Promise<Schemas['ScheduledAppointmentDto'][]> => {
    const searchParams = mapToQueryString({
      date,
      locationId,
      timeSlot,
    })

    return this.get(context, `/api/schedules/${agencyId}/appointments?${searchParams}`)
  }

  public getAgencies(context: Context): Promise<Schemas['PrisonContactDetail'][]> {
    return this.get(context, '/api/agencies/prison')
  }

  public getAgencyDetails(context: Context, agencyId: string): Promise<Schemas['Agency']> {
    return this.get(context, `/api/agencies/${agencyId}?activeOnly=false`)
  }

  public globalSearch(
    context: Context,
    params: GlobalSearchRequest,
    resultsLimit: number
  ): Promise<Schemas['PrisonerDetail']> {
    const { offenderNo, lastName, firstName, gender, location, dateOfBirth, includeAliases } = params

    const searchParams = mapToQueryString({
      offenderNo,
      lastName,
      firstName,
      gender,
      location,
      dob: dateOfBirth,
      partialNameMatch: false,
      includeAliases,
    })
    return this.get(context, `/api/prisoners?${searchParams}`, resultsLimit)
  }

  public getPrisonerDetails(context: Context, offenderNo: string, fullInfo = false): Promise<Schemas['InmateDetail']> {
    return this.get(context, `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}`)
  }

  public getLocation(context: Context, locationId: number): Promise<Schemas['Location']> {
    return this.get(context, `/api/locations/${locationId}`)
  }

  public getLocationsForAppointments(context: Context, agencyId: string): Promise<Schemas['Location'][]> {
    return this.get(context, `/api/agencies/${agencyId}/locations?eventType=APP`)
  }

  public getAppointmentTypes(context: Context): Promise<Schemas['ReferenceCode'][]> {
    return this.get(context, '/api/reference-domains/scheduleReasons?eventType=APP')
  }
}

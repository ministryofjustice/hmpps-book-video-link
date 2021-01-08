import type {
  InmateDetail,
  OffenderBooking,
  PrisonerSchedule,
  PrisonContactDetail,
  PrisonerDetail,
  Agency,
  Location,
} from 'prisonApi'
import { Response } from 'superagent'
import contextProperties from '../contextProperties'
import { mapToQueryString } from '../utils'
import Client from './oauthEnabledClient'

type Context = any

type ActivityListRequest = {
  agencyId: string
  locationId: number
  usage: string
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

  private processResponse<T>(context: Context): (Response) => T {
    return (response: Response) => {
      contextProperties.setResponsePagination(context, response.headers)
      return response.body
    }
  }

  private get<T>(context: Context, url: string, resultsLimit?: number): Promise<T> {
    return this.client.get(context, url, resultsLimit).then(this.processResponse(context))
  }

  public getPrisonBooking(context: Context, bookingId: number): Promise<InmateDetail> {
    return this.get(context, `/api/bookings/${bookingId}`)
  }

  public getPrisonBookings(context: Context, bookingIds: number[]): Promise<OffenderBooking[]> {
    return this.get(context, `/api/bookings?bookingId=${bookingIds}`, 1000)
  }

  public getActivityList(
    context: Context,
    { agencyId, locationId, usage, date, timeSlot }: ActivityListRequest
  ): Promise<PrisonerSchedule[]> {
    return this.get(
      context,
      `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?${
        timeSlot ? `timeSlot=${timeSlot}&` : ''
      }date=${date}`
    )
  }

  public getAgencies(context: Context): Promise<PrisonContactDetail[]> {
    return this.get(context, '/api/agencies/prison')
  }

  public getAgencyDetails(context: Context, agencyId: string): Promise<Agency> {
    return this.get(context, `/api/agencies/${agencyId}?activeOnly=false`)
  }

  public globalSearch(context: Context, params: GlobalSearchRequest, resultsLimit: number): Promise<PrisonerDetail[]> {
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

  public getPrisonerDetails(context: Context, offenderNo: string, fullInfo = false): Promise<InmateDetail> {
    return this.get(context, `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}`)
  }

  public getLocation(context: Context, locationId: number): Promise<Location> {
    return this.get(context, `/api/locations/${locationId}`)
  }

  public getLocationsForAppointments(context: Context, agencyId: string): Promise<Location[]> {
    return this.get(context, `/api/agencies/${agencyId}/locations?eventType=APP`)
  }
}

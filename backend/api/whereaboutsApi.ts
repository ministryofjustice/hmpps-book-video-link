import {
  CourtLocations,
  NewVideoLinkBooking,
  VideoLinkBooking,
  AppointmentLocationsSpecification,
  AvailableLocation,
} from 'whereaboutsApi'

import { Response } from 'superagent'
import type Client from './oauthEnabledClient'
import { mapToQueryString } from '../utils'

type Context = any

export = class WhereaboutsApi {
  constructor(private readonly client: Client) {}

  private processResponse(response: Response) {
    return response.body
  }

  private get(context: Context, url: string) {
    return this.client.get(context, url).then(this.processResponse)
  }

  private post(context: Context, url: string, data) {
    return this.client.post(context, url, data).then(this.processResponse)
  }

  private delete(context: Context, url: string) {
    return this.client.delete(context, url).then(this.processResponse)
  }

  public getCourtLocations(context: Context): Promise<CourtLocations> {
    return this.get(context, '/court/all-courts')
  }

  public createVideoLinkBooking(context: Context, body: NewVideoLinkBooking): Promise<number> {
    return this.post(context, '/court/video-link-bookings', body)
  }

  public getVideoLinkBooking(context: Context, videoBookingId: number): Promise<VideoLinkBooking> {
    return this.get(context, `/court/video-link-bookings/${videoBookingId}`)
  }

  public getAvailableRooms(context: Context, request: AppointmentLocationsSpecification): Promise<AvailableLocation[]> {
    return this.post(context, '/court/appointment-location-finder', request)
  }

  public getVideoLinkBookings(
    context: Context,
    agencyId: string,
    date: moment.Moment,
    court?: string
  ): Promise<VideoLinkBooking[]> {
    const searchParams = mapToQueryString({
      court,
    })

    return this.get(
      context,
      `/court/video-link-bookings/prison/${agencyId}/date/${date.format('YYYY-MM-DD')}?${searchParams}`
    )
  }

  public deleteVideoLinkBooking(context: Context, videoBookingId: number): Promise<void> {
    return this.delete(context, `/court/video-link-bookings/${videoBookingId}`)
  }
}

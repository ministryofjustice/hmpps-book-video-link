import type Client from './oauthEnabledClient'
import {
  CourtLocations,
  NewVideoLinkBooking,
  VideoLinkAppointment,
  VideoLinkAppointmentIds,
  VideoLinkBooking,
} from './whereaboutsApiTypes'
import { mapToQueryString } from '../utils'

export = class WhereaboutsApi {
  constructor(private readonly client: Client) {}

  private processResponse(response) {
    return response.body
  }

  private get(context, url) {
    return this.client.get(context, url).then(this.processResponse)
  }

  private post(context, url, data) {
    return this.client.post(context, url, data).then(this.processResponse)
  }

  private delete(context, url) {
    return this.client.delete(context, url).then(this.processResponse)
  }

  public getCourtLocations(context): Promise<CourtLocations> {
    return this.get(context, '/court/all-courts')
  }

  public createVideoLinkBooking(context, body: NewVideoLinkBooking): Promise<number> {
    return this.post(context, '/court/video-link-bookings', body)
  }

  public getVideoLinkAppointments(context, body: VideoLinkAppointmentIds): Promise<VideoLinkAppointment> {
    return this.post(context, '/court/video-link-appointments', body)
  }

  public getVideoLinkBooking(context, videoBookingId: number): Promise<VideoLinkBooking> {
    return this.get(context, `/court/video-link-bookings/${videoBookingId}`)
  }

  public getVideoLinkBookings(context, date: string, court?: string): Promise<VideoLinkBooking[]> {
    const searchParams = mapToQueryString({
      date,
      court,
    })

    return this.get(context, `/court/video-link-bookings/${searchParams}`)
  }

  public deleteVideoLinkBooking(context, videoBookingId: number): Promise<void> {
    return this.delete(context, `/court/video-link-bookings/${videoBookingId}`)
  }
}

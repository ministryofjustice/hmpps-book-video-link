import {
  AppointmentLocationsSpecification,
  AvailableLocations,
  Court,
  CourtEmail,
  NewVideoLinkBooking,
  UpdateVideoLinkBooking,
  VideoLinkBooking,
  Location,
  VideoLinkBookingOptions,
  VideoLinkBookingSearchSpecification,
  VideoLinkBookingSearchAcrossMultiplePrisonsSpecification,
} from 'whereaboutsApi'

import { Response } from 'superagent'
import moment from 'moment'
import Client, { Context } from './oauthEnabledClient'
import { setCustomRequestHeaders } from '../contextProperties'
import { DATE_ONLY_FORMAT_SPEC } from '../shared/dateHelpers'

export = class WhereaboutsApi {
  constructor(private readonly client: Client) {}

  private processResponse(response: Response) {
    return response?.body
  }

  private get(context: Context, url: string) {
    return this.client.get(context, url).then(this.processResponse)
  }

  private getPotential(context: Context, url: string) {
    return this.client.getPotential(context, url).then(this.processResponse)
  }

  private post(context: Context, url: string, data) {
    return this.client.post(context, url, data).then(this.processResponse)
  }

  private put(context: Context, url: string, data, contentType?: string) {
    return this.client.put(context, url, data, contentType).then(this.processResponse)
  }

  private delete(context: Context, url: string) {
    return this.client.delete(context, url).then(this.processResponse)
  }

  public getCourts(context: Context): Promise<Court[]> {
    return this.get(context, '/court/courts')
  }

  public getCourtEmail(context: Context, courtId: string): Promise<CourtEmail> {
    return this.getPotential(context, `/court/courts/${courtId}/email`)
  }

  public checkAvailability(
    context: Context,
    request: VideoLinkBookingSearchSpecification
  ): Promise<VideoLinkBookingOptions> {
    return this.post(context, '/court/video-link-booking-check', request)
  }

  public createVideoLinkBooking(context: Context, body: NewVideoLinkBooking): Promise<number> {
    return this.post(context, '/court/video-link-bookings', body)
  }

  public getVideoLinkBooking(context: Context, videoBookingId: number): Promise<VideoLinkBooking> {
    return this.get(context, `/court/video-link-bookings/${videoBookingId}`)
  }

  public getAvailableRooms(context: Context, request: AppointmentLocationsSpecification): Promise<AvailableLocations> {
    return this.post(context, '/court/vlb-appointment-location-finder', request)
  }

  public getRooms(context: Context, agencyId: string): Promise<Location[]> {
    return this.get(context, `/video-link-rooms/${agencyId}`)
  }

  public findVideoLinkBookings(
    context: Context,
    body: VideoLinkBookingSearchAcrossMultiplePrisonsSpecification,
    date: moment.Moment
  ): Promise<VideoLinkBooking[]> {
    return this.post(context, `/court/video-link-bookings/date/${date.format('YYYY-MM-DD')}`, body)
  }

  public updateVideoLinkBookingComment(context: Context, videoBookingId: number, comment: string): Promise<void> {
    return this.put(context, `/court/video-link-bookings/${videoBookingId}/comment`, comment, 'text/plain')
  }

  public updateVideoLinkBooking(
    context: Context,
    videoBookingId: number,
    update: UpdateVideoLinkBooking
  ): Promise<void> {
    return this.put(context, `/court/video-link-bookings/${videoBookingId}`, update)
  }

  public deleteVideoLinkBooking(context: Context, videoBookingId: number): Promise<void> {
    return this.delete(context, `/court/video-link-bookings/${videoBookingId}`)
  }

  public getVideoLinkEventsCSV(
    context: Context,
    stream: NodeJS.WritableStream,
    date: moment.Moment,
    days?: number
  ): void {
    setCustomRequestHeaders(context, { Accept: 'text/csv' })
    const daysQP = days ? `&days=${days}` : ''
    this.client.getToStream(
      context,
      `/events/video-link-booking-events?start-date=${date.format(DATE_ONLY_FORMAT_SPEC)}${daysQP}`,
      stream
    )
  }

  public getVideoLinkBookingsCSV(
    context: Context,
    stream: NodeJS.WritableStream,
    date: moment.Moment,
    days?: number
  ): void {
    setCustomRequestHeaders(context, { Accept: 'text/csv' })
    const daysQP = days ? `&days=${days}` : ''
    this.client.getToStream(
      context,
      `/court/video-link-bookings?start-date=${date.format(DATE_ONLY_FORMAT_SPEC)}${daysQP}`,
      stream
    )
  }
}

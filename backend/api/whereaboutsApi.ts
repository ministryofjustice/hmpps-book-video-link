export default class WhereaboutsApi {
  constructor(private readonly client) {}

  private processResponse(response) {
    return response.body
  }

  private get(context, url) {
    return this.client.get(context, url).then(this.processResponse)
  }

  private post(context, url, data) {
    return this.client.post(context, url, data).then(this.processResponse)
  }

  public getCourtLocations(context) {
    return this.get(context, '/court/all-courts')
  }

  public createVideoLinkBooking(context, body) {
    return this.post(context, '/court/video-link-bookings', body)
  }

  public getVideoLinkAppointments(context, body) {
    return this.post(context, '/court/video-link-appointments', body)
  }
}

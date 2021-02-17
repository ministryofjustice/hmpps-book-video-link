import type { Prisoner, BookingIds } from 'prisonerOffenderSearchApi'
import { Response } from 'superagent'
import Client, { Context } from './oauthEnabledClient'

export default class PrisonerOffenderSearchApi {
  constructor(private readonly client: Client) {}

  private processResponse = <T>(response: Response): T => response.body

  private post<T>(context: Context, url: string, data): Promise<T> {
    return this.client.post(context, url, data).then(response => this.processResponse(response))
  }

  public getPrisoners(context: Context, bookingIds: number[]): Promise<Prisoner[]> {
    const request: BookingIds = { bookingIds }
    return this.post(context, `/prisoner-search/booking-ids`, request)
  }
}

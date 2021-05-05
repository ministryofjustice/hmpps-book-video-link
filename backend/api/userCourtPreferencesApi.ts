import type { PreferencesDTO } from 'userPreferences'
import { Response } from 'superagent'
import Client, { Context } from './oauthEnabledClient'

export default class UserCourtPreferencesApi {
  constructor(private readonly client: Client) {}

  private processResponse = <T>(response: Response): T => response.body

  private get<T>(url: string): Promise<T> {
    return this.client.get({}, url).then(response => this.processResponse(response))
  }

  public async getUserPreferredCourts(userId: string): Promise<PreferencesDTO> {
    const courts = await this.get<PreferencesDTO>(`/users/${userId}/preferences/video_link_booking.preferred_courts`)
    return courts
  }

  private put<T>(context, url: string, data): Promise<T> {
    return this.client.put(context, url, data).then(response => this.processResponse(response))
  }

  public putUserPreferredCourts(context: Context, userId: string, preferredCourts: string[]): Promise<PreferencesDTO> {
    const courts = { items: preferredCourts }
    return this.put(context, `/users/${userId}/preferences/video_link_booking.preferred_courts`, courts)
  }
}

import type { CourtDtoPage, CourtDto } from 'courtRegister'
import { Response } from 'superagent'
import Client from './oauthEnabledClient'

export default class CourtApi {
  constructor(private readonly client: Client) {}

  private processResponse = <T>(response: Response): T => response.body

  private get<T>(url: string): Promise<T> {
    return this.client.get({}, url).then(response => this.processResponse(response))
  }

  public async getCourts(): Promise<CourtDto[]> {
    const courtDtoPage = await this.get<CourtDtoPage>(
      `/courts/paged?courtTypeIds=CRN&courtTypeIds=COU&courtTypeIds=MAG&courtTypeIds=IMM&size=1000`
    )
    return courtDtoPage.content
  }
}

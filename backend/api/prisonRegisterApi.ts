import { Response } from 'superagent'
import Client, { Context } from './oauthEnabledClient'

export default class PrisonRegisterApi {
  constructor(private readonly client: Client) {}

  private processStringResponse = (response: Response): string => response.text

  private getString(context: Context, url: string): Promise<string> {
    return this.client.get(context, url).then(response => this.processStringResponse(response))
  }

  public getVideoLinkConferencingCentreEmailAddress(context: Context, prisonId: string): Promise<string> {
    return this.getString(context, `/secure/prisons/id/${prisonId}/videolink-conferencing-centre/email-address`)
  }

  public getOffenderManagementUnitEmailAddress(context: Context, prisonId: string): Promise<string> {
    return this.getString(context, `/secure/prisons/id/${prisonId}/offender-management-unit/email-address`)
  }
}

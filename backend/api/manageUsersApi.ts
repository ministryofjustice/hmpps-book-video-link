import { Response } from 'superagent'
import contextProperties from '../contextProperties'
import Client, { Context } from './oauthEnabledClient'

export type UserDetails = {
  username: string
  active: boolean
  name: string
  authSource: string
  staffId?: number
  activeCaseLoadId?: string
  userId: string
  uuid?: string
}

export type User = {
  username: string
}

export type Role = {
  roleCode: string
}

export type EmailAddress = {
  username: string
  email?: string
  verified: boolean
}

export default class ManageUsersApi {
  constructor(private readonly client: Client) {}

  private processResponse<T>(context: Context): (Response) => T {
    return (response: Response) => {
      contextProperties.setResponsePagination(context, response.headers)
      return response.body
    }
  }

  private get<T>(context: Context, url: string): Promise<T> {
    return this.client.get(context, url).then(this.processResponse(context))
  }

  public currentUser(context: Context): Promise<User> {
    return this.get(context, `/users/me`)
  }

  public userRoles(context: Context): Promise<Role[]> {
    return this.get(context, `/users/me/roles`)
  }

  public userEmail(context: Context, username: string): Promise<EmailAddress> {
    return this.get(context, `/users/${username}/email`)
  }

  public userDetails(context: Context, username: string): Promise<UserDetails> {
    return this.get(context, `/users/${username}`)
  }
}

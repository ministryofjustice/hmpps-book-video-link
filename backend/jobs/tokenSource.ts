import axios, { AxiosInstance } from 'axios'
import { apiClientCredentials } from '../api/oauthApi'
import logger from '../log'
import errorStatusCode from '../error-status-code'

interface OAuth2Config {
  clientId: string
  clientSecret: string
  url: string
  timeoutSeconds: number
  [propName: string]: any
}

export default class TokenSource {
  private readonly axiosInstance: AxiosInstance

  private readonly url: string

  constructor(oauth2Config: OAuth2Config) {
    this.url = oauth2Config.url
    this.axiosInstance = axios.create({
      timeout: oauth2Config.timeoutSeconds * 1000,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${apiClientCredentials(oauth2Config.clientId, oauth2Config.clientSecret)}`,
      },
    })
  }

  // eslint-disable-next-line camelcase
  getTokens: () => Promise<{ access_token: string; refresh_token: string }> = () =>
    this.axiosInstance
      .post(`${this.url}oauth/token?grant_type=client_credentials`)
      .then(response => {
        logger.debug(
          `EventsRetriever ${response.config.method} ${response.config.url} ${response.status} ${response.statusText}`
        )
        return response.data
      })
      .catch(error => {
        const status = errorStatusCode(error)
        const errorDesc = (error.response && error.response.data && error.response.data.error_description) || null

        if (parseInt(status, 10) < 500 && errorDesc !== null) {
          logger.info(`EventsRetriever ${error.config.method} ${error.config.url} ${status} ${errorDesc}`)

          throw Error('Authentication error')
        }

        logger.error(`EventsRetriever ${error.config.method} ${error.config.url} ${status} ${error.message}`)
        throw error
      })
}

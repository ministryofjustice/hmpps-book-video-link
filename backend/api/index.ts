import WhereaboutsApi from './whereaboutsApi'
import Client from './oauthEnabledClient'

import config from '../config'
import PrisonApi from './prisonApi'
import { oauthApiFactory } from './oauthApi'
import { tokenVerificationApiFactory } from './tokenVerificationApi'
import { notifyApi } from './notifyApi'

const prisonApi = new PrisonApi(
  new Client({
    baseUrl: config.apis.prison.url,
    timeout: config.apis.prison.timeoutSeconds * 1000,
  })
)

const whereaboutsApi = new WhereaboutsApi(
  new Client({
    baseUrl: config.apis.whereabouts.url,
    timeout: config.apis.whereabouts.timeoutSeconds * 1000,
  })
)

const oauthApi = oauthApiFactory(
  new Client({
    baseUrl: config.apis.oauth2.url,
    timeout: config.apis.oauth2.timeoutSeconds * 1000,
  }),
  { ...config.apis.oauth2 }
)

const tokenVerificationApi = tokenVerificationApiFactory(
  new Client({
    baseUrl: config.apis.tokenverification.url,
    timeout: config.apis.tokenverification.timeoutSeconds * 1000,
  })
)

export const apis = {
  notifyApi,
  oauthApi,
  prisonApi,
  tokenVerificationApi,
  whereaboutsApi,
}

export type Apis = typeof apis

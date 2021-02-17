import config from '../config'
import Client from './oauthEnabledClient'

import WhereaboutsApi from './whereaboutsApi'
import PrisonApi from './prisonApi'
import PrisonerOffenderSearchApi from './prisonerOffenderSearchApi'

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

const prisonerOffenderSearchApi = new PrisonerOffenderSearchApi(
  new Client({
    baseUrl: config.apis.prisonerOffenderSearch.url,
    timeout: config.apis.prisonerOffenderSearch.timeoutSeconds * 1000,
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
  prisonerOffenderSearchApi,
  tokenVerificationApi,
  whereaboutsApi,
}

export type Apis = typeof apis

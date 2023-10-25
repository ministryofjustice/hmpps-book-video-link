import config from '../config'
import Client from './oauthEnabledClient'
import WhereaboutsApi from './whereaboutsApi'
import PrisonApi from './prisonApi'
import PrisonerOffenderSearchApi from './prisonerOffenderSearchApi'
import PrisonRegisterApi from './prisonRegisterApi'

import { oauthApiFactory } from './oauthApi'
import { tokenVerificationApiFactory } from './tokenVerificationApi'
import { notifyApi } from './notifyApi'
import UserCourtPreferencesApi from './userCourtPreferencesApi'
import ManageUsersApi from './manageUsersApi'

const userCourtPreferencesApi = new UserCourtPreferencesApi(
  new Client({
    baseUrl: config.apis.userPreferences.url,
    timeout: config.apis.userPreferences.timeoutSeconds * 1000,
  })
)

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

const manageUsersApi = new ManageUsersApi(
  new Client({
    baseUrl: config.apis.manageUsers.url,
    timeout: config.apis.manageUsers.timeoutSeconds * 1000,
  })
)

const oauthApi = oauthApiFactory({ ...config.apis.oauth2 })

const tokenVerificationApi = tokenVerificationApiFactory(
  new Client({
    baseUrl: config.apis.tokenverification.url,
    timeout: config.apis.tokenverification.timeoutSeconds * 1000,
  })
)

const prisonRegisterApi = new PrisonRegisterApi(
  new Client({
    baseUrl: config.apis.prisonRegister.url,
    timeout: config.apis.prisonRegister.timeoutSeconds * 1000,
  })
)

export const apis = {
  userCourtPreferencesApi,
  notifyApi,
  oauthApi,
  manageUsersApi,
  prisonApi,
  prisonRegisterApi,
  prisonerOffenderSearchApi,
  tokenVerificationApi,
  whereaboutsApi,
}

export type Apis = typeof apis

export { WhereaboutsApi, PrisonApi }

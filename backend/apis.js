const WhereaboutsApi = require('./api/whereaboutsApi')
const Client = require('./api/oauthEnabledClient')

const config = require('./config')
const { prisonApiFactory } = require('./api/prisonApi')
const { oauthApiFactory } = require('./api/oauthApi')
const { tokenVerificationApiFactory } = require('./api/tokenVerificationApi')

const prisonApi = prisonApiFactory(
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

module.exports = {
  prisonApi,
  whereaboutsApi,
  oauthApi,
  tokenVerificationApi,
}

require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const express = require('express')
const csrf = require('csurf')

const app = express()

const path = require('path')
const { oauthApi, prisonApi, tokenVerificationApi, whereaboutsApi } = require('./apis')
const config = require('./config')
const routes = require('./routes')

const setupWebSession = require('./setupWebSession')
const setupHealthChecks = require('./setupHealthChecks')
const setupBodyParsers = require('./setupBodyParsers')
const setupWebSecurity = require('./setupWebSecurity')
const setupAuth = require('./setupAuth')
const setupStaticContent = require('./setupStaticContent')
const nunjucksSetup = require('./utils/nunjucksSetup')
const setupRedirects = require('./setupRedirects')
const setupCurrentUserAndRequestLogging = require('./setupCurrentUserAndRequestLogging')
const setupAuthorisation = require('./setupAuthorisation')
const errorHandler = require('./middleware/errorHandler')

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'njk')

nunjucksSetup(app, path)

app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi, tokenVerificationApi }))
app.use(csrf())
app.use(setupCurrentUserAndRequestLogging({ oauthApi }))
app.use(setupAuthorisation())
app.use(
  routes({
    prisonApi,
    whereaboutsApi,
    oauthApi,
  })
)

app.use(errorHandler)

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})

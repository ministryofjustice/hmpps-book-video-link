/* eslint-disable import/order */
/* eslint-disable import/first */
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler'

dotenv.config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
import _ from './azure-appinsights'

import express from 'express'
import csrf from 'csurf'

const app = express()

import path from 'path'
import { services } from './services'
import config from './config'
import routes from './routes'

import setupWebSession from './setupWebSession'
import setupHealthChecks from './setupHealthChecks'
import setupBodyParsers from './setupBodyParsers'
import setupWebSecurity from './setupWebSecurity'
import setupAuth from './setupAuth'
import setupStaticContent from './setupStaticContent'
import nunjucksSetup from './utils/nunjucksSetup'
import setupRedirects from './setupRedirects'
import setupCurrentUserAndRequestLogging from './setupCurrentUserAndRequestLogging'
import setupAuthorisation from './setupAuthorisation'

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'njk')

nunjucksSetup(app, path)

app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth(services))
app.use(csrf())
app.use(setupCurrentUserAndRequestLogging(services))
app.use(setupAuthorisation())
app.use(routes(services))

app.use(errorHandler(config.app.production))

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})

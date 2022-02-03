const express = require('express')
const helmet = require('helmet').default
const noCache = require('nocache')
const cookieParser = require('cookie-parser')

const config = require('./config')
const ensureHttps = require('./middleware/ensureHttps')

const sixtyDaysInSeconds = 5184000

const router = express.Router()

module.exports = () => {
  router.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      hsts: {
        maxAge: sixtyDaysInSeconds,
        includeSubDomains: true,
        preload: true,
      },
    })
  )

  router.use(cookieParser(config.hmppsCookie.sessionSecret))

  if (config.app.production) {
    router.use(ensureHttps)
  }

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}

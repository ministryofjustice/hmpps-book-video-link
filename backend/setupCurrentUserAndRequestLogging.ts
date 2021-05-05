import express, { Router } from 'express'
import createRequestLogger from './middleware/requestLogger'

import loggingSerialiser from './loggingSerialiser'
import currentUser from './middleware/currentUser'

export default function setupCurrentUserAndRequestLogging({ oauthApi }): Router {
  const router = express.Router()
  router.use(currentUser({ oauthApi }))
  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
    }
    next()
  })

  router.use(createRequestLogger({ name: 'Book video link http', serializers: loggingSerialiser }))

  return router
}

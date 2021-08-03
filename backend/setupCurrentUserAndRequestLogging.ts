import express, { Router } from 'express'
import createRequestLogger from './middleware/requestLogger'

import loggingSerialiser from './loggingSerialiser'
import currentUser from './middleware/currentUser'
import asyncMiddleware from './middleware/asyncMiddleware'
import type { Services } from './services'

export default function setupCurrentUserAndRequestLogging({ oauthApi, manageCourtsService }: Services): Router {
  const router = express.Router()
  router.use(asyncMiddleware(currentUser(oauthApi, manageCourtsService)))
  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
      hostname: req.hostname,
    }
    next()
  })

  router.use(createRequestLogger({ name: 'Book video link http', serializers: loggingSerialiser }))

  return router
}

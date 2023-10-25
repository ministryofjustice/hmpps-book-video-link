import express, { Router } from 'express'
import createRequestLogger from './middleware/requestLogger'

import loggingSerialiser from './loggingSerialiser'
import currentUser from './middleware/currentUser'
import asyncMiddleware from './middleware/asyncMiddleware'
import type { Services } from './services'
import storeCurrentUrl from './middleware/storeCurrentUrl'

export default function setupCurrentUserAndRequestLogging({ manageUsersApi, manageCourtsService }: Services): Router {
  const router = express.Router()
  router.use(asyncMiddleware(currentUser(manageUsersApi, manageCourtsService)))
  router.use(storeCurrentUrl())

  router.use(createRequestLogger({ name: 'Book video link http', serializers: loggingSerialiser }))

  return router
}

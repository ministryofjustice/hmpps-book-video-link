import express, { Router } from 'express'
import ManageCourtsController from './manageCourtsController'
import manageCourtsValidation from './manageCourtsValidation'
import CourtSelectionConfirmationController from './courtSelectionConfirmationController'

import validationMiddleware from '../../middleware/validationMiddleware'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import type { Services } from '../../services'

export default function createRoutes({ manageCourtsService }: Services): Router {
  const router = express.Router()
  const courtsList = new ManageCourtsController(manageCourtsService)
  const courtsConfirmation = new CourtSelectionConfirmationController()

  router.get('/manage-courts', asyncMiddleware(courtsList.view()))
  router.post('/manage-courts', validationMiddleware(manageCourtsValidation), asyncMiddleware(courtsList.submit()))

  router.get('/court-list-updated', asyncMiddleware(courtsConfirmation.view()))

  return router
}

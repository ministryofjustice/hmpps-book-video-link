import express, { Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import withRetryLink from '../../middleware/withRetryLink'
import { Services } from '../../services'

import StartController from './startController'
import SelectCourtController from './selectCourtController'
import OffenderDetailsController from './offenderDetailsController'
import ConfirmationController from './confirmationController'
import startValidation from './startValidation'
import selectCourtValidation from './selectCourtValidation'
import offenderDetailsValidation from './offenderDetailsValidation'

export default function createRoutes({ locationService, notificationService }: Services): Router {
  const startController = new StartController(locationService)
  const selectCourtController = new SelectCourtController(locationService)
  const offenderDetailsController = new OffenderDetailsController(locationService, notificationService)
  const confirmationController = new ConfirmationController()

  const routes = express.Router({ mergeParams: true })

  routes.get('/', withRetryLink('/request-booking'), asyncMiddleware(startController.view()))
  routes.post(
    '/check-availability',
    withRetryLink('/request-booking'),
    validationMiddleware(startValidation),
    asyncMiddleware(startController.submit())
  )
  routes.get(
    '/select-court',
    withRetryLink('/request-booking/select-court'),
    asyncMiddleware(selectCourtController.view())
  )
  routes.post(
    '/validate-court',
    withRetryLink('/request-booking/select-court'),
    validationMiddleware(selectCourtValidation),
    asyncMiddleware(selectCourtController.submit())
  )
  routes.get(
    '/enter-offender-details',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(offenderDetailsController.view())
  )
  routes.post(
    '/create-booking-request',
    withRetryLink('/request-booking/enter-offender-details'),
    validationMiddleware(offenderDetailsValidation),
    asyncMiddleware(offenderDetailsController.submit())
  )
  routes.get(
    '/confirmation',
    withRetryLink('/request-booking/confirmation'),
    asyncMiddleware(confirmationController.view())
  )
  routes.get('/prisoner-not-listed', (req, res) => res.render('requestBooking/prisonerNotListed.njk'))

  const router = express.Router({ mergeParams: true })
  router.use('/request-booking', routes)
  return router
}

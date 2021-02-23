import express, { Router } from 'express'
import { requestBookingFactory } from './requestBooking'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import withRetryLink from '../../middleware/withRetryLink'
import logError from '../../logError'
import { Services } from '../../services'

import StartController from './startController'
import requestBookingValidation from './requestBookingValidation'
import selectCourtValidation from './selectCourtValidation'
import offenderDetailsValidation from './offenderDetailsValidation'

export default function createRoutes({
  locationService,
  notifyApi,
  whereaboutsApi,
  oauthApi,
  prisonApi,
}: Services): Router {
  const startController = new StartController(locationService)

  const routes = express.Router({ mergeParams: true })

  const { selectCourt, validateCourt, enterOffenderDetails, createBookingRequest, confirm } = requestBookingFactory({
    logError,
    notifyApi,
    whereaboutsApi,
    oauthApi,
    prisonApi,
  })

  routes.get('/', withRetryLink('/request-booking'), asyncMiddleware(startController.view()))
  routes.post(
    '/check-availability',
    withRetryLink('/request-booking'),
    validationMiddleware(requestBookingValidation),
    asyncMiddleware(startController.submit())
  )
  routes.get('/select-court', withRetryLink('/request-booking/select-court'), asyncMiddleware(selectCourt))
  routes.post(
    '/validate-court',
    withRetryLink('/request-booking/select-court'),
    validationMiddleware(selectCourtValidation),
    asyncMiddleware(validateCourt)
  )
  routes.get(
    '/enter-offender-details',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(enterOffenderDetails)
  )
  routes.post(
    '/create-booking-request',
    withRetryLink('/request-booking/enter-offender-details'),
    validationMiddleware(offenderDetailsValidation),
    asyncMiddleware(createBookingRequest)
  )
  routes.get('/confirmation', withRetryLink('/request-booking/confirmation'), asyncMiddleware(confirm))
  routes.get('/prisoner-not-listed', (req, res) => res.render('requestBooking/prisonerNotListed.njk'))

  const router = express.Router({ mergeParams: true })
  router.use('/request-booking', routes)
  return router
}

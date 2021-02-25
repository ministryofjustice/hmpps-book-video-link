import express, { Router } from 'express'
import { requestBookingFactory } from './requestBooking'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import withRetryLink from '../../middleware/withRetryLink'
import logError from '../../logError'
import { Services } from '../../services'

import StartController from './startController'
import SelectCourtController from './selectCourtController'
import requestBookingValidation from './requestBookingValidation'
import selectCourtValidation from './selectCourtValidation'
import offenderDetailsValidation from './offenderDetailsValidation'

export default function createRoutes({ locationService, notifyApi, oauthApi, prisonApi }: Services): Router {
  const startController = new StartController(locationService)
  const selectCourtController = new SelectCourtController(locationService)

  const routes = express.Router({ mergeParams: true })

  const { enterOffenderDetails, createBookingRequest, confirm } = requestBookingFactory({
    logError,
    notifyApi,
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

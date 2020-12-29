import express, { Router } from 'express'
import { requestBookingFactory } from './requestBooking'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import withRetryLink from '../../middleware/withRetryLink'
import logError from '../../logError'
import { Services } from '../../services'

export default function createRoutes({ notifyApi, whereaboutsApi, oauthApi, prisonApi }: Services): Router {
  const routes = express.Router({ mergeParams: true })

  const {
    startOfJourney,
    checkAvailability,
    selectCourt,
    validateCourt,
    enterOffenderDetails,
    createBookingRequest,
    confirm,
  } = requestBookingFactory({
    logError,
    notifyApi,
    whereaboutsApi,
    oauthApi,
    prisonApi,
  })

  routes.get('/', withRetryLink('/request-booking'), asyncMiddleware(startOfJourney))
  routes.post('/check-availability', withRetryLink('/request-booking'), asyncMiddleware(checkAvailability))
  routes.get('/select-court', withRetryLink('/request-booking/select-court'), asyncMiddleware(selectCourt))
  routes.post('/validate-court', withRetryLink('/request-booking/select-court'), asyncMiddleware(validateCourt))
  routes.get(
    '/enter-offender-details',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(enterOffenderDetails)
  )
  routes.post(
    '/create-booking-request',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(createBookingRequest)
  )
  routes.get('/confirmation', withRetryLink('/request-booking/confirmation'), asyncMiddleware(confirm))
  routes.get('/prisoner-not-listed', (req, res) => res.render('requestBooking/prisonerNotListed.njk'))

  const router = express.Router({ mergeParams: true })
  router.use('/request-booking', routes)
  return router
}

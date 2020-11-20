const express = require('express')
const { requestBookingFactory } = require('../../controllers/appointments/requestBooking')
const asyncMiddleware = require('../../middleware/asyncMiddleware')
const withRetryLink = require('../../middleware/withRetryLink')

const router = express.Router({ mergeParams: true })

const controller = ({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi }) => {
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
    notifyClient,
    whereaboutsApi,
    oauthApi,
    prisonApi,
  })

  router.get('/', withRetryLink('/request-booking'), asyncMiddleware(startOfJourney))
  router.post('/check-availability', withRetryLink('/request-booking'), asyncMiddleware(checkAvailability))
  router.get('/select-court', withRetryLink('/request-booking/select-court'), asyncMiddleware(selectCourt))
  router.post('/validate-court', withRetryLink('/request-booking/select-court'), asyncMiddleware(validateCourt))
  router.get(
    '/enter-offender-details',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(enterOffenderDetails)
  )
  router.post(
    '/create-booking-request',
    withRetryLink('/request-booking/enter-offender-details'),
    asyncMiddleware(createBookingRequest)
  )
  router.get('/confirmation', withRetryLink('/request-booking/confirmation'), asyncMiddleware(confirm))
  router.get(
    '/prisoner-not-listed',
    asyncMiddleware(async (req, res) => {
      return res.render('requestBooking/prisonerNotListed.njk', {
        url: req.originalUrl,
        user: { displayName: req.session.userDetails.name },
      })
    })
  )

  return router
}

module.exports = dependencies => controller(dependencies)

const express = require('express')

const { logError } = require('./logError')
const asyncMiddleware = require('./middleware/asyncMiddleware')
const withRetryLink = require('./middleware/withRetryLink')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewCourtBookingsController = require('./controllers/viewCourtBookingsRouter')
const requestBookingRouter = require('./routes/appointments/requestBookingRouter')
const videolinkPrisonerSearchController = require('./controllers/videolink/search/videolinkPrisonerSearch')
const { notifyClient } = require('./shared/notifyClient')

const router = express.Router()

const setup = ({ prisonApi, whereaboutsApi, oauthApi }) => {
  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ prisonApi }))

  router.use('/:agencyId/offenders/:offenderNo/add-court-appointment', addCourtAppointmentRouter({ prisonApi }))

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ prisonApi, whereaboutsApi })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({ prisonApi, whereaboutsApi, oauthApi, notifyClient })
  )

  router.get('/prisoner-search', withRetryLink('/'), asyncMiddleware(videolinkPrisonerSearchController({ prisonApi })))

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      res.render('courtsVideolink.njk', {
        user: { displayName: req.session.userDetails.name },
      })
    })
  )

  router.get(
    '/bookings',
    withRetryLink('/bookings'),
    asyncMiddleware(viewCourtBookingsController(prisonApi, whereaboutsApi))
  )

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi }))

  router.use((req, res, next) => {
    res.status(404).render('notFoundPage.njk')
  })

  return router
}

module.exports = dependencies => setup(dependencies)

const express = require('express')

const { logError } = require('./logError')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewCourtBookingsRouter = require('./routes/appointments/viewCourtBookingsRouter')
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

  router.get('/prisoner-search', videolinkPrisonerSearchController({ prisonApi }))

  router.get('/', async (req, res) => {
    res.render('courtsVideolink.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/',
    })
  })

  router.use('/bookings', viewCourtBookingsRouter({ prisonApi, whereaboutsApi }))

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi }))

  router.use((req, res, next) => {
    res.status(404).render('notFoundPage.njk')
  })

  return router
}

module.exports = dependencies => setup(dependencies)

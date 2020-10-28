const express = require('express')

const { logError } = require('./logError')

const addAppointmentRouter = require('./routes/appointments/addAppointmentRouter')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const prepostAppointmentRouter = require('./routes/appointments/prepostAppointmentsRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewAppointmentsRouter = require('./routes/appointments/viewAppointmentsRouter')
const viewCourtBookingsRouter = require('./routes/appointments/viewCourtBookingsRouter')
const requestBookingRouter = require('./routes/appointments/requestBookingRouter')
const attendanceChangeRouter = require('./routes/attendanceChangesRouter')
const videolinkPrisonerSearchController = require('./controllers/videolink/search/videolinkPrisonerSearch')
const currentUser = require('./middleware/currentUser')
const { notifyClient } = require('./shared/notifyClient')
const { raiseAnalyticsEvent } = require('./raiseAnalyticsEvent')

const router = express.Router()

const setup = ({ elite2Api, whereaboutsApi, oauthApi }) => {
  router.use(currentUser({ elite2Api, oauthApi }))

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  router.use('/offenders/:offenderNo/add-appointment', addAppointmentRouter({ elite2Api, logError }))
  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ elite2Api, logError }))
  router.use(
    '/offenders/:offenderNo/prepost-appointments',
    prepostAppointmentRouter({ elite2Api, logError, oauthApi, whereaboutsApi, notifyClient, raiseAnalyticsEvent })
  )
  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment',
    addCourtAppointmentRouter({ elite2Api, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ elite2Api, whereaboutsApi, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({ elite2Api, whereaboutsApi, logError, oauthApi, notifyClient })
  )

  router.get('/videolink/prisoner-search', videolinkPrisonerSearchController({ oauthApi, elite2Api, logError }))

  router.get('/videolink', async (req, res) => {
    res.render('courtsVideolink.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/videolink',
    })
  })

  router.use('/videolink/bookings', viewCourtBookingsRouter({ elite2Api, whereaboutsApi, logError }))

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api }))

  router.use('/appointments', viewAppointmentsRouter({ elite2Api, whereaboutsApi, oauthApi, logError }))

  router.use('/attendance-changes', attendanceChangeRouter({ elite2Api, whereaboutsApi, oauthApi, logError }))

  return router
}

module.exports = dependencies => setup(dependencies)

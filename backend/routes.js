const express = require('express')

const { logError } = require('./logError')
const config = require('./config')

const bulkAppointmentsAddDetailsRouter = require('./routes/appointments/bulkAppointmentsAddDetailsRouter')
const bulkAppointmentsConfirmRouter = require('./routes/appointments/bulkAppointmentsConfirmRouter')
const bulkAppointmentsInvalidNumbersRouter = require('./routes/appointments/bulkAppointmentsInvalidNumbersRouter')
const bulkAppointmentsAddedRouter = require('./routes/appointments/bulkAppointmentsAddedRouter')
const bulkAppointmentsSlipsRouter = require('./routes/appointments/bulkAppointmentsSlipsRouter')
const bulkAppointmentsUploadRouter = require('./routes/appointments/bulkAppointmentsUploadRouter')
const bulkAppointmentsClashesRouter = require('./routes/appointments/bulkAppointmentsClashesRouter')

const changeCaseloadRouter = require('./routes/changeCaseloadRouter')
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

  router.get('/bulk-appointments/need-to-upload-file', async (req, res) => {
    res.render('bulkAppointmentsAdd.njk', { title: 'You need to upload a CSV file' })
  })

  router.get('/bulk-appointments/no-appointments-added', async (req, res) => {
    const { reason } = req.query
    req.session.data = null
    res.render('bulkAppointmentsNotAdded.njk', { reason })
  })

  router.use('/bulk-appointments/upload-file', bulkAppointmentsUploadRouter({ elite2Api, logError }))
  router.use(
    '/bulk-appointments/add-appointment-details',
    bulkAppointmentsAddDetailsRouter({ elite2Api, oauthApi, logError })
  )
  router.use('/bulk-appointments/appointments-added', bulkAppointmentsAddedRouter({ logError }))
  router.get('/bulk-appointments/appointments-movement-slips', bulkAppointmentsSlipsRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/confirm-appointments', bulkAppointmentsConfirmRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/appointment-clashes', bulkAppointmentsClashesRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/invalid-numbers', bulkAppointmentsInvalidNumbersRouter({ elite2Api, logError }))

  router.use('/change-caseload', changeCaseloadRouter({ elite2Api, logError }))

  router.get('/terms', async (req, res) => {
    res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
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

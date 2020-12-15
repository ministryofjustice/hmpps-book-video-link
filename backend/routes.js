const express = require('express')

const { logError } = require('./logError')
const asyncMiddleware = require('./middleware/asyncMiddleware')
const withRetryLink = require('./middleware/withRetryLink')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewCourtBookingsController = require('./controllers/viewCourtBookingsController')
const requestBookingRouter = require('./routes/appointments/requestBookingRouter')
const videolinkPrisonerSearchController = require('./controllers/videolink/search/videolinkPrisonerSearch')
const { notifyClient } = require('./shared/notifyClient')
const BookingService = require('./services/bookingService')
const DeleteAppointmentController = require('./controllers/appointments/deleteAppointment')
const AppointmentsService = require('./services/appointmentsService')

const router = express.Router()

const setup = ({ prisonApi, whereaboutsApi, oauthApi }) => {
  const appointmentsService = new AppointmentsService(prisonApi, whereaboutsApi)

  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter(prisonApi, appointmentsService))

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment',
    addCourtAppointmentRouter({ prisonApi, appointmentsService })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ prisonApi, whereaboutsApi })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({ prisonApi, oauthApi, notifyClient, appointmentsService })
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

  const bookingService = new BookingService(prisonApi, whereaboutsApi)

  router.get('/bookings', withRetryLink('/bookings'), asyncMiddleware(viewCourtBookingsController(bookingService)))

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi }))

  const deleteBooking = new DeleteAppointmentController(appointmentsService)

  router.get('/delete-booking/:bookingId', asyncMiddleware(deleteBooking.viewDelete))

  router.post('/delete-booking/:bookingId', asyncMiddleware(deleteBooking.confirmDelete))

  router.get('/court/booking-delete-confirmed', (req, res) => {
    return res.render('deleteAppointment/bookingDeleteConfirmed.njk', {
      offenderName: req.flash('offenderName'),
      offenderNo: req.flash('offenderNo'),
      agencyId: req.flash('agencyId'),
    })
  })

  router.use((req, res, next) => {
    res.status(404).render('notFoundPage.njk')
  })

  return router
}

module.exports = dependencies => setup(dependencies)

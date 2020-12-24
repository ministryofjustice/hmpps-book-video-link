import express, { Router } from 'express'

import { logError } from './logError'
import asyncMiddleware from './middleware/asyncMiddleware'
import withRetryLink from './middleware/withRetryLink'
import addCourtAppointmentRouter from './routes/appointments/courtRouter'
import confirmAppointmentRouter from './routes/appointments/confirmAppointmentRouter'
import selectCourtAppointmentRooms from './routes/appointments/selectCourtAppointmentRoomsRouter'
import selectCourtAppointmentCourt from './routes/appointments/selectCourtAppointmentCourtRouter'
import viewCourtBookingsController from './controllers/viewCourtBookingsController'
import requestBookingRouter from './routes/appointments/requestBookingRouter'
import videolinkPrisonerSearchController from './controllers/videolink/search/videolinkPrisonerSearch'
import DeleteBookingController from './controllers/appointments/deleteBooking'
import { Services } from './services'

const router = express.Router()

export = function createRoutes({
  appointmentService,
  availableSlotsService,
  bookingService,
  existingEventsService,
  prisonApi,
  notifyApi,
  whereaboutsApi,
  oauthApi,
}: Services): Router {
  const deleteBooking = new DeleteBookingController(appointmentService)

  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter(prisonApi, appointmentService))

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment',
    addCourtAppointmentRouter({ prisonApi, existingEventsService, availableSlotsService })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ prisonApi, whereaboutsApi })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({
      prisonApi,
      oauthApi,
      notifyApi,
      availableSlotsService,
      existingEventsService,
      appointmentService,
    })
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

  router.get('/bookings', withRetryLink('/bookings'), asyncMiddleware(viewCourtBookingsController(bookingService)))

  router.use('/request-booking', requestBookingRouter({ logError, notifyApi, whereaboutsApi, oauthApi, prisonApi }))

  router.get('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.viewDelete()))

  router.post('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.confirmDeletion()))

  router.get('/video-link-deleted', asyncMiddleware(deleteBooking.deleteConfirmed()))

  router.use((req, res, next) => {
    res.status(404).render('notFoundPage.njk')
  })

  return router
}

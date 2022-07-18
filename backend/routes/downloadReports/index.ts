import express, { Router } from 'express'
import { Services } from '../../services'
import EventsController from './downloadEventsController'
import IndexController from './indexController'
import BookingsController from './downloadBookingsController'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const eventsController = new EventsController(services.whereaboutsApi)
  const bookingsController = new BookingsController(services.whereaboutsApi)
  const indexController = new IndexController()
  router.get('/video-link-booking-events', indexController.viewSelectionPage)
  router.post('/video-link-booking-events', indexController.submitSelection)
  router.get('/video-link-booking-events-csv', bookingsController.getCsvBooking)
  router.get('/download-by-booking-date', bookingsController.viewBookingPage)
  router.get('/video-link-hearing-events-csv', eventsController.getCsvHearing)
  router.get('/download-by-hearing-date', eventsController.viewHearingPage)
  return router
}

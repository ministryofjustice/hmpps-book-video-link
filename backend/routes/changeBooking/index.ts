import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DeleteBookingController from './deleteBookingController'
import BookingDetailsController from './bookingDetailsController'

export default function createRoutes({ bookingService }: Services): Router {
  const deleteBooking = new DeleteBookingController(bookingService)
  const bookingDetails = new BookingDetailsController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/booking-details/:bookingId', asyncMiddleware(bookingDetails.viewDetails()))

  router.get('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.viewDelete()))
  router.post('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.confirmDeletion()))

  router.get('/video-link-deleted', asyncMiddleware(deleteBooking.deleteConfirmed()))

  return router
}

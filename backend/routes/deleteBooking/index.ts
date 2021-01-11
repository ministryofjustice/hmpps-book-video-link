import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DeleteBookingController from './deleteBookingController'

export default function createRoutes({ bookingService }: Services): Router {
  const deleteBooking = new DeleteBookingController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/delete-booking/:bookingId', asyncMiddleware(deleteBooking.viewDelete()))
  router.post('/delete-booking/:bookingId', asyncMiddleware(deleteBooking.confirmDeletion()))

  router.get('/booking-deleted', asyncMiddleware(deleteBooking.deleteConfirmed()))

  return router
}

import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DeleteBookingController from './deleteBookingController'

export default function createRoutes({ appointmentService }: Services): Router {
  const deleteBooking = new DeleteBookingController(appointmentService)

  const router = express.Router({ mergeParams: true })

  router.get('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.viewDelete()))
  router.post('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.confirmDeletion()))

  router.get('/video-link-deleted', asyncMiddleware(deleteBooking.deleteConfirmed()))

  return router
}

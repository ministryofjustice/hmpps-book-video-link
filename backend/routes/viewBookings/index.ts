import express, { Router } from 'express'
import viewCourtBookingsController from './viewCourtBookingsController'
import BookingDetailsController from './bookingDetailsController'

import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import type { Services } from '../../services'

export default function createRoutes({ bookingService, viewBookingsService }: Services): Router {
  const router = express.Router({ mergeParams: true })
  const bookingDetails = new BookingDetailsController(bookingService)
  const viewCourtBooking = viewCourtBookingsController(viewBookingsService)

  router.get('/bookings', withRetryLink('/bookings'), asyncMiddleware(viewCourtBooking))
  router.get('/booking-details/:bookingId', asyncMiddleware(bookingDetails.viewDetails()))

  return router
}

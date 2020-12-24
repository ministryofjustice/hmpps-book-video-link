import express, { Router } from 'express'
import viewCourtBookingsController from './viewCourtBookingsController'

import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import { Services } from '../../services'

export default function createRoutes({ bookingService }: Services): Router {
  const router = express.Router({ mergeParams: true })

  router.get('/bookings', withRetryLink('/bookings'), asyncMiddleware(viewCourtBookingsController(bookingService)))

  return router
}

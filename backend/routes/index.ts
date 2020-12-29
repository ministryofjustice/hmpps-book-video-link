import express, { Router } from 'express'

import { Services } from '../services'

import requestBookingRoutes from './requestBooking'
import createBookingRoutes from './createBooking'
import changeBookingRoutes from './changeBooking'
import viewBookingsRoutes from './viewBookings'

const router = express.Router()

export = function createRoutes(services: Services): Router {
  router.get('/', (req, res) => res.render('courtsVideolink.njk'))

  router.use(createBookingRoutes(services))
  router.use(changeBookingRoutes(services))
  router.use(requestBookingRoutes(services))
  router.use(viewBookingsRoutes(services))

  router.use((req, res, next) => res.status(404).render('notFoundPage.njk'))

  return router
}

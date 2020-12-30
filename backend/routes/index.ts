import express, { Router } from 'express'

import type { Services } from '../services'

import requestBookingRoutes from './requestBooking'
import createBookingRoutes from './createBooking'
import deleteBookingRoutes from './deleteBooking'
import viewBookingsRoutes from './viewBookings'
import amendBookingsRoutes from './amendBooking'

const router = express.Router()

export = function createRoutes(services: Services): Router {
  router.get('/', (req, res) => res.render('home.njk'))

  router.use(createBookingRoutes(services))
  router.use(deleteBookingRoutes(services))
  router.use(requestBookingRoutes(services))
  router.use(viewBookingsRoutes(services))
  router.use(amendBookingsRoutes(services))

  router.use((req, res, next) => res.status(404).render('notFoundPage.njk'))

  return router
}

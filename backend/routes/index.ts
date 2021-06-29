import express, { Router } from 'express'

import type { Services } from '../services'

import manageCourtsRoutes from './manageCourts'
import requestBookingRoutes from './requestBooking'
import createBookingRoutes from './createBooking'
import createBookingRoutesV2 from './createBooking-v2'
import deleteBookingRoutes from './deleteBooking'
import viewBookingsRoutes from './viewBookings'
import viewBookingsRoutesV2 from './viewBookings-v2'
import eventRoutes from './events'
import amendBookingsRoutes from './amendBooking'
import amendBookingsRoutesV2 from './amendBooking-v2'
import asyncMiddleware from '../middleware/asyncMiddleware'
import checkForPreferredCourts from '../middleware/checkForPreferredCourts'

import { supportEmail, supportTelephone, app } from '../config'

const router = express.Router()

export = function createRoutes(services: Services): Router {
  router.get('/courts-not-selected', (req, res) => {
    res.render('courtsNotSelected.njk')
  })
  router.use(manageCourtsRoutes(services))
  router.use(asyncMiddleware(checkForPreferredCourts()))

  router.get('/', (req, res) => res.render('home.njk'))

  router.use(deleteBookingRoutes(services))
  router.use(requestBookingRoutes(services))

  if (app.newAvailabilityCheckEnabled) {
    router.use(createBookingRoutesV2(services))
    router.use(amendBookingsRoutesV2(services))
    router.use(viewBookingsRoutesV2(services))
  } else {
    router.use(createBookingRoutes(services))
    router.use(amendBookingsRoutes(services))
    router.use(viewBookingsRoutes(services))
  }

  router.use(eventRoutes(services))

  router.get('/feedback-and-support', (req, res) => {
    res.render('feedbackAndSupport.njk', { supportEmail, supportTelephone })
  })
  router.use((req, res) => res.status(404).render('notFoundPage.njk'))

  return router
}

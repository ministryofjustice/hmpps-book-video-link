import express, { Router } from 'express'

import type { Services } from '../services'

import manageCourtsRoutes from './manageCourts'
import requestBookingRoutes from './requestBooking'
import createBookingRoutes from './createBooking'
import deleteBookingRoutes from './deleteBooking'
import viewBookingsRoutes from './viewBookings'
import downloadRoutes from './downloadReports'
import amendBookingsRoutes from './amendBooking'
import asyncMiddleware from '../middleware/asyncMiddleware'
import checkForPreferredCourts from '../middleware/checkForPreferredCourts'

import { supportEmail, supportTelephone } from '../config'

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

  router.use(createBookingRoutes(services))
  router.use(amendBookingsRoutes(services))
  router.use(viewBookingsRoutes(services))

  router.use(downloadRoutes(services))

  router.get('/feedback-and-support', (req, res) => {
    res.render('feedbackAndSupport.njk', { supportEmail, supportTelephone })
  })
  router.use((req, res) => res.status(404).render('notFoundPage.njk'))

  return router
}

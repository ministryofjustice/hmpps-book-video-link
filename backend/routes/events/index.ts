import express, { Router } from 'express'
import { Services } from '../../services'
import EventsController from './eventsController'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const eventsController = new EventsController(services.whereaboutsApi)
  router.get('/video-link-booking-events-csv', eventsController.getCsv)
  router.get('/video-link-booking-events', eventsController.view)
  return router
}

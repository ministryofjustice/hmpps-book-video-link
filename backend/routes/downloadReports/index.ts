import express, { Router } from 'express'
import { Services } from '../../services'
import IndexController from './indexController'
import DownloadByEventTimestampController from './downloadByEventTimestampController'
import DownloadByHearingDateController from './downloadByHearingDateController'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const downloadByEventTimestamp = new DownloadByEventTimestampController(services.whereaboutsApi)
  const downloadByHearingDate = new DownloadByHearingDateController(services.whereaboutsApi)
  const indexController = new IndexController()
  router.get('/video-link-booking-events', indexController.viewSelectionPage)
  router.post('/video-link-booking-events', indexController.submitSelection)

  router.get('/video-link-booking-events/download-by-booking-date', downloadByEventTimestamp.viewPage)
  router.get('/video-link-events-csv', downloadByEventTimestamp.viewCsv)

  router.get('/video-link-booking-events/download-by-hearing-date', downloadByHearingDate.viewPage)
  router.get('/video-links-by-hearing-date-csv', downloadByHearingDate.viewCsv)

  return router
}

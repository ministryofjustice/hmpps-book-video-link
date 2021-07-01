import express, { Router } from 'express'

import prisonerSearch from './prisonerSearch/prisonerSearchController'
import { NewBookingController, newBookingValidation } from './newBooking'
import VideoLinkNotAvailableController from './notAvailable/NotAvailableController'
import { ConfirmBookingController, confirmBookingValidation } from './confirmBooking'
import ConfirmationController from './viewConfirmation/confirmationController'

import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import checkAvailability from '../../middleware/checkAvailability'

import { Services } from '../../services'
import { ensureNewBookingPresentMiddleware } from './state'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const checkRooms = asyncMiddleware(checkAvailability(services))
  const checkNewBookingPresent = ensureNewBookingPresentMiddleware('/prisoner-search')

  router.get('/prisoner-search', withRetryLink('/'), asyncMiddleware(prisonerSearch(services)))

  {
    const newBookingController = new NewBookingController(
      services.prisonApi,
      services.availabilityCheckService,
      services.locationService
    )
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment'
    router.get('/:agencyId/offenders/:offenderNo/new-court-appointment', newBookingController.start())
    router.get(path, asyncMiddleware(newBookingController.view()))
    router.post(path, newBookingValidation, asyncMiddleware(newBookingController.submit()))
  }

  {
    const { view } = new VideoLinkNotAvailableController(services.availabilityCheckService)
    router.get('/:agencyId/offenders/:offenderNo/add-court-appointment/video-link-not-available', asyncMiddleware(view))
  }

  {
    const { view, submit } = new ConfirmBookingController(
      services.locationService,
      services.prisonApi,
      services.bookingService
    )
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/confirm-booking'
    router.get(path, checkNewBookingPresent, asyncMiddleware(view))
    router.post(path, checkNewBookingPresent, confirmBookingValidation, checkRooms, asyncMiddleware(submit))
  }

  const { view } = new ConfirmationController(services.bookingService, services.locationService)
  router.get(
    '/offenders/:offenderNo/confirm-appointment/:videoBookingId',
    withRetryLink('/prisoner-search'),
    asyncMiddleware(view)
  )

  return router
}

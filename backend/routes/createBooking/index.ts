import express, { Router } from 'express'

import PrisonerSearchController from './prisonerSearch/prisonerSearchController'
import { NewBookingController, newBookingValidation } from './newBooking'
import NotAvailableController from './notAvailable/NotAvailableController'
import { ConfirmBookingController, confirmBookingValidation } from './confirmBooking'
import ConfirmationController from './viewConfirmation/confirmationController'

import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import { Services } from '../../services'
import { ensureNewBookingPresentMiddleware } from './state'
import RoomNoLongerAvailableController from './roomNoLongerAvailable/RoomNoLongerAvailableController'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const checkNewBookingPresent = ensureNewBookingPresentMiddleware('/prisoner-search')

  const prisonerSearch = new PrisonerSearchController(services.prisonApi)
  router.get('/prisoner-search', withRetryLink('/'), asyncMiddleware(prisonerSearch.submit()))

  {
    const newBookingController = new NewBookingController(
      services.prisonApi,
      services.availabilityCheckServiceV2,
      services.locationService
    )
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment'
    router.get('/:agencyId/offenders/:offenderNo/new-court-appointment', newBookingController.start())
    router.get(path, asyncMiddleware(newBookingController.view()))
    router.post(path, newBookingValidation, asyncMiddleware(newBookingController.submit()))
  }

  {
    const { view, submit } = new NotAvailableController(services.availabilityCheckServiceV2)
    router.get(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/video-link-not-available',
      checkNewBookingPresent,
      asyncMiddleware(view)
    )
    router.post(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/video-link-not-available',
      checkNewBookingPresent,
      asyncMiddleware(submit)
    )
  }

  {
    const { view, submit } = new ConfirmBookingController(
      services.locationService,
      services.prisonApi,
      services.bookingService
    )
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/confirm-booking'
    router.get(path, checkNewBookingPresent, asyncMiddleware(view))
    router.post(path, checkNewBookingPresent, confirmBookingValidation, asyncMiddleware(submit))
  }

  {
    const { view } = new ConfirmationController(services.bookingService, services.locationService)
    router.get(
      '/offenders/:offenderNo/confirm-appointment/:videoBookingId',
      withRetryLink('/prisoner-search'),
      asyncMiddleware(view)
    )
  }

  {
    const { view } = new RoomNoLongerAvailableController()
    router.get(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/video-link-no-longer-available',
      asyncMiddleware(view)
    )
  }

  return router
}

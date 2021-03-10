import express, { Router } from 'express'

import prisonerSearch from './prisonerSearchController'
import StartController from './startController'
import SelectCourtController from './selectCourtController'
import selectCourtValidation from './selectCourtValidation'
import SelectRoomController from './selectRoomsController'
import selectRoomsValidation from './selectRoomsValidation'
import ConfirmationController from './confirmationController'

import dateAndTimeValidation from '../../shared/dateAndTimeValidation'
import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import checkAvailability from '../../middleware/checkAvailability'
import validationMiddleware from '../../middleware/validationMiddleware'

import { Services } from '../../services'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const checkRooms = asyncMiddleware(checkAvailability(services))

  router.get('/prisoner-search', withRetryLink('/'), asyncMiddleware(prisonerSearch(services)))

  {
    const startController = new StartController(services.prisonApi, services.availabilityCheckService)
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment'
    router.get('/:agencyId/offenders/:offenderNo/new-court-appointment', startController.start())
    router.get(path, withRetryLink('/prisoner-search'), asyncMiddleware(startController.view()))
    router.post(path, validationMiddleware(dateAndTimeValidation), asyncMiddleware(startController.submit()))
  }

  {
    const { view, submit } = new SelectCourtController(services.locationService, services.prisonApi)
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court'
    router.get(path, asyncMiddleware(view))
    router.post(path, validationMiddleware(selectCourtValidation), asyncMiddleware(submit))
  }

  {
    const { view, submit } = new SelectRoomController(
      services.prisonApi,
      services.bookingService,
      services.availabilityCheckService
    )
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms'
    router.get(path, asyncMiddleware(view))
    router.post(path, validationMiddleware(selectRoomsValidation), checkRooms, asyncMiddleware(submit))
  }

  const { view } = new ConfirmationController(services.bookingService)
  router.get(
    '/offenders/:offenderNo/confirm-appointment/:videoBookingId',
    withRetryLink('/prisoner-search'),
    asyncMiddleware(view)
  )

  return router
}

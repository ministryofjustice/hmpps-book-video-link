import express, { Router } from 'express'

import confirmation from './confirmationController'
import StartController from './startController'
import selectCourt from './selectCourtController'
import selectRooms from './selectRoomsController'
import prisonerSearch from './prisonerSearchController'
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
    router.get(path, withRetryLink('/prisoner-search'), asyncMiddleware(startController.view()))
    router.post(path, validationMiddleware(dateAndTimeValidation), startController.submit())
  }

  {
    const { index, post } = selectCourt(services)
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court'
    router.get(path, asyncMiddleware(index))
    router.post(path, asyncMiddleware(post))
  }

  {
    const { index, validateInput, createAppointments } = selectRooms(services)
    const path = '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms'
    router.get(path, asyncMiddleware(index))
    router.post(path, validateInput, checkRooms, asyncMiddleware(createAppointments))
  }

  router.get(
    '/offenders/:offenderNo/confirm-appointment',
    withRetryLink('/prisoner-search'),
    asyncMiddleware(confirmation(services))
  )

  return router
}

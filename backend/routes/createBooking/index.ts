import express, { Router } from 'express'

import confirmAppointment from './confirmAppointment'
import addCourtAppointment from './addCourtAppointment'
import selectCourtAppointmentCourt from './selectCourtAppointmentCourt'
import selectCourtAppointmentRooms from './selectCourtAppointmentRooms'
import videolinkPrisonerSearchController from './videolinkPrisonerSearchController'

import withRetryLink from '../../middleware/withRetryLink'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import checkAppointmentRooms from '../../middleware/checkAppointmentRooms'

import { Services } from '../../services'

export default function createRoutes(services: Services): Router {
  const router = express.Router({ mergeParams: true })

  const checkRooms = asyncMiddleware(
    checkAppointmentRooms(services.existingEventsService, services.availableSlotsService)
  )

  router.get(
    '/offenders/:offenderNo/confirm-appointment',
    withRetryLink('/prisoner-search'),
    asyncMiddleware(confirmAppointment(services))
  )

  {
    const { index, validateInput, goToCourtSelection } = addCourtAppointment(services.prisonApi)

    router.get(
      '/:agencyId/offenders/:offenderNo/add-court-appointment',
      withRetryLink('/prisoner-search'),
      asyncMiddleware(index)
    )

    router.post('/:agencyId/offenders/:offenderNo/add-court-appointment', validateInput, checkRooms, goToCourtSelection)
  }

  {
    const { index, post } = selectCourtAppointmentCourt(services.prisonApi, services.whereaboutsApi)
    router.get('/:agencyId/offenders/:offenderNo/add-court-appointment/select-court', asyncMiddleware(index))
    router.post('/:agencyId/offenders/:offenderNo/add-court-appointment/select-court', asyncMiddleware(post))
  }

  {
    const { index, validateInput, createAppointments } = selectCourtAppointmentRooms(services)

    router.get('/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms', asyncMiddleware(index))
    router.post(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
      validateInput,
      checkRooms,
      asyncMiddleware(createAppointments)
    )
  }

  router.get('/prisoner-search', withRetryLink('/'), asyncMiddleware(videolinkPrisonerSearchController(services)))

  return router
}

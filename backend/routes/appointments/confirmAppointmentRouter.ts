import express from 'express'
import confirmAppointment from '../../controllers/appointments/confirmAppointment'
import type AppointmentsService from '../../services/appointmentsService'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import withRetryLink from '../../middleware/withRetryLink'

export = (prisonApi, appointmentsService: AppointmentsService): any => {
  const { index } = confirmAppointment.confirmAppointmentFactory({ prisonApi, appointmentsService })

  const router = express.Router({ mergeParams: true })
  router.get('/', withRetryLink('/prisoner-search'), asyncMiddleware(index))

  return router
}

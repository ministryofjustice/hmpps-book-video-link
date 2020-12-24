import express from 'express'
import confirmAppointment from '../../controllers/appointments/confirmAppointment'
import type AppointmentService from '../../services/appointmentService'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import withRetryLink from '../../middleware/withRetryLink'

export = (prisonApi, appointmentService: AppointmentService): any => {
  const { index } = confirmAppointment.confirmAppointmentFactory({ prisonApi, appointmentService })

  const router = express.Router({ mergeParams: true })
  router.get('/', withRetryLink('/prisoner-search'), asyncMiddleware(index))

  return router
}

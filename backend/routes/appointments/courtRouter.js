const express = require('express')
const { addCourtAppointmentsFactory } = require('../../controllers/appointments/addCourtAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlots = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')
const asyncMiddleware = require('../../middleware/asyncMiddleware')
const withRetryLink = require('../../middleware/withRetryLink')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi }) => {
  const existingEventsService = existingEventsServiceFactory(prisonApi)
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const availableSlotsService = availableSlots({ existingEventsService, appointmentsService })

  const { index, validateInput, goToCourtSelection } = addCourtAppointmentsFactory(prisonApi)

  router.get('/', withRetryLink('/prisoner-search'), asyncMiddleware(index))
  router.post(
    '/',
    validateInput,
    asyncMiddleware(checkAppointmentRooms(existingEventsService, availableSlotsService)),
    goToCourtSelection
  )

  return router
}

module.exports = dependencies => controller(dependencies)

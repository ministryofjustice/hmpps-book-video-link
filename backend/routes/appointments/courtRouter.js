const express = require('express')
const { addCourtAppointmentsFactory } = require('../../controllers/appointments/addCourtAppointment')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlots = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')
const asyncMiddleware = require('../../middleware/asyncMiddleware')
const withRetryLink = require('../../middleware/withRetryLink')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, appointmentsService }) => {
  const existingEventsService = existingEventsServiceFactory(prisonApi, appointmentsService)
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

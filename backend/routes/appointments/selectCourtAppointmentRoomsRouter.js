const express = require('express')
const { selectCourtAppointmentRoomsFactory } = require('../../controllers/appointments/selectCourtAppointmentRooms')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlotsService = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')
const asyncMiddleware = require('../../middleware/asyncMiddleware')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, oauthApi, notifyClient, appointmentsService }) => {
  const existingEventsService = existingEventsServiceFactory(prisonApi, appointmentsService)
  const availableSlots = availableSlotsService({ existingEventsService, appointmentsService })
  const { index, validateInput, createAppointments } = selectCourtAppointmentRoomsFactory({
    prisonApi,
    oauthApi,
    notifyClient,
    appointmentsService,
    existingEventsService,
  })

  router.get('/', asyncMiddleware(index))
  router.post(
    '/',
    validateInput,
    asyncMiddleware(checkAppointmentRooms(existingEventsService, availableSlots)),
    asyncMiddleware(createAppointments)
  )

  return router
}

module.exports = dependencies => controller(dependencies)

const express = require('express')
const { selectCourtAppointmentRoomsFactory } = require('../../controllers/appointments/selectCourtAppointmentRooms')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')
const asyncMiddleware = require('../../middleware/asyncMiddleware')

const router = express.Router({ mergeParams: true })

const controller = ({
  prisonApi,
  oauthApi,
  notifyApi,
  availableSlotsService,
  existingEventsService,
  appointmentService,
}) => {
  const { index, validateInput, createAppointments } = selectCourtAppointmentRoomsFactory({
    prisonApi,
    oauthApi,
    notifyApi,
    appointmentService,
    existingEventsService,
  })

  router.get('/', asyncMiddleware(index))
  router.post(
    '/',
    validateInput,
    asyncMiddleware(checkAppointmentRooms(existingEventsService, availableSlotsService)),
    asyncMiddleware(createAppointments)
  )

  return router
}

module.exports = dependencies => controller(dependencies)

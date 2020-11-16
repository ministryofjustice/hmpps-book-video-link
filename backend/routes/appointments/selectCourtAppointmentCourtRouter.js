const express = require('express')
const { selectCourtAppointmentCourtFactory } = require('../../controllers/appointments/selectCourtAppointmentCourt')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, whereaboutsApi }) => {
  const { index, post } = selectCourtAppointmentCourtFactory(prisonApi, whereaboutsApi)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)

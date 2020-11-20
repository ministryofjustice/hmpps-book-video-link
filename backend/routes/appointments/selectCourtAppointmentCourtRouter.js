const express = require('express')
const { selectCourtAppointmentCourtFactory } = require('../../controllers/appointments/selectCourtAppointmentCourt')
const asyncMiddleware = require('../../middleware/asyncMiddleware')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, whereaboutsApi }) => {
  const { index, post } = selectCourtAppointmentCourtFactory(prisonApi, whereaboutsApi)

  router.get('/', asyncMiddleware(index))
  router.post('/', asyncMiddleware(post))

  return router
}

module.exports = dependencies => controller(dependencies)

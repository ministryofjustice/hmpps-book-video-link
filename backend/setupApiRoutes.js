const express = require('express')
const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')
const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const offenderServiceFactory = require('./services/offenderService')
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const establishmentRollFactory = require('./controllers/establishmentRollCount').getEstablishmentRollCountFactory
const { globalSearchFactory } = require('./controllers/globalSearch')
const { imageFactory } = require('./controllers/images')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const { appointmentsServiceFactory } = require('./services/appointmentsService')
const endDateController = require('./controllers/appointments/endDate')
const currentUser = require('./middleware/currentUser')
const controllerFactory = require('./controllers/controller').factory
const contextProperties = require('./contextProperties')
const { csvParserService } = require('./csv-parser')

const router = express.Router()

const setup = ({ elite2Api, oauthApi, offenderSearchApi }) => {
  const controller = controllerFactory({
    establishmentRollService: establishmentRollFactory(elite2Api),
    globalSearchService: globalSearchFactory(offenderSearchApi),
    offenderLoader: offenderLoaderFactory(elite2Api),
    appointmentsService: appointmentsServiceFactory(elite2Api),
    csvParserService: csvParserService({ fs, isBinaryFileSync }),
    offenderService: offenderServiceFactory(elite2Api),
  })
  router.use(currentUser({ elite2Api, oauthApi }))

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  // Extract pagination header information from requests and set on the 'context'
  router.use('/api', (req, res, next) => {
    contextProperties.setRequestPagination(res.locals, req.headers)
    next()
  })

  router.use('/api/config', getConfiguration)
  router.use('/api/userroles', userMeFactory(oauthApi).userRoles)
  router.use('/api/me', userMeFactory(oauthApi).userMe)
  router.use('/api/usercaseloads', userCaseLoadsFactory(elite2Api).userCaseloads)
  router.use('/api/userLocations', userLocationsFactory(elite2Api).userLocations)
  router.use('/api/offenders/:offenderNo', controller.getOffender)
  router.use('/api/establishmentRollCount', controller.getEstablishmentRollCount)
  router.use('/api/globalSearch', controller.globalSearch)
  router.use('/api/appointments/upload-offenders/:agencyId', controller.uploadOffenders)
  router.get('/app/images/:offenderNo/data', imageFactory(elite2Api).prisonerImage)
  router.get('/app/image/:imageId/data', imageFactory(elite2Api).image)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/get-recurring-end-date', endDateController)

  return router
}

module.exports = dependencies => setup(dependencies)

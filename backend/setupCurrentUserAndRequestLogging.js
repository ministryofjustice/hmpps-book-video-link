const express = require('express')
const bunyanRequestLogger = require('bunyan-request-logger')

const loggingSerialiser = require('./loggingSerialiser')
const currentUser = require('./middleware/currentUser')

const router = express.Router()

module.exports = ({ oauthApi }) => {
  router.use(currentUser({ oauthApi }))
  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  router.use(bunyanRequestLogger({ name: 'Book video link http', serializers: loggingSerialiser }).requestLogger())

  return router
}

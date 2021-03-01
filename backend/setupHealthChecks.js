const express = require('express')
const config = require('./config')
const healthFactory = require('./services/healthCheck').default

const router = express.Router()

const health = healthFactory([
  { name: 'auth', url: config.apis.oauth2.url },
  { name: 'prison', url: config.apis.prison.url },
  { name: 'whereabouts', url: config.apis.whereabouts.url },
  { name: 'tokenverification', url: config.apis.tokenverification.url },
  { name: 'prisonerOffenderSearch', url: config.apis.prisonerOffenderSearch.url },
])

module.exports = () => {
  router.get('/health', (req, res, next) => {
    health((err, result) => {
      if (err) {
        return next(err)
      }
      if (!(result.status === 'UP')) {
        res.status(503)
      }
      return res.json(result)
    })
  })

  router.get('/ping', (req, res) => res.send('pong'))

  return router
}

const express = require('express')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  router.get('/', (req, res) => res.redirect(301, '/videolink'))

  return router
}

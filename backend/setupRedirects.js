const express = require('express')
const config = require('./config')

const router = express.Router()
const email = 'mailto:feedback@digital.justice.gov.uk'
const { loginUrl } = config.app

module.exports = () => {
  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))
  router.get('/invalidRole', (req, res) => {
    res.render('invalidRole', { email, loginUrl })
  })
  return router
}

const express = require('express')
const { supportEmail } = require('./config')

const requiredRoles = ['VIDEO_LINK_COURT_USER', 'GLOBAL_SEARCH']
const router = express.Router()

module.exports = () => {
  router.get('/no-service-access', (req, res) => {
    res.render('noServiceAccess', { supportEmail })
  })

  router.use((req, res, next) => {
    const userRolesExtracted = res.locals.userRoles.map(userRole => userRole.roleCode)

    const userHasRequiredRoles = requiredRoles.every(requiredRole => userRolesExtracted.includes(requiredRole))
    if (userHasRequiredRoles) {
      next()
    } else {
      res.redirect(301, '/no-service-access')
    }
  })

  return router
}

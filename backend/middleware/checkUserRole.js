const express = require('express')

const requiredRoles = ['VIDEO_LINK_COURT_USER', 'GLOBAL_SEARCH']
const router = express.Router()

module.exports = () => {
  router.use(async (req, res, next) => {
    const { userRoles } = res.locals
    const userHasRequiredRole =
      userRoles.filter(role => requiredRoles.includes(role.roleCode)).length === requiredRoles.length
    if (userHasRequiredRole) {
      next()
    } else {
      res.redirect(301, '/invalidRole')
    }
  })
  return router
}

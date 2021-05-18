import { RequestHandler } from 'express'
import { forenameToInitial } from '../utils'

import config from '../config'
import ManageCourtsService from '../services/manageCourtsService'

export default (oauthApi, manageCourtsService: ManageCourtsService): RequestHandler => async (req, res, next) => {
  if (!req.xhr) {
    if (!req.session.userDetails) {
      req.session.userDetails = await oauthApi.currentUser(res.locals)
    }
    if (!req.session.userRoles) {
      req.session.userRoles = await oauthApi.userRoles(res.locals)
    }

    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }

    const { name, username } = req.session.userDetails

    if (!req.session.preferredCourts) {
      req.session.preferredCourts = await manageCourtsService.getSelectedCourts(res.locals, username)
    }

    const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const clientID = config.apis.oauth2.clientId

    res.locals.user = {
      ...res.locals.user,
      displayName: forenameToInitial(name),
      username,
      returnUrl,
      clientID,
    }

    res.locals.userRoles = req.session.userRoles
    res.locals.preferredCourts = req.session.preferredCourts
  }
  next()
}

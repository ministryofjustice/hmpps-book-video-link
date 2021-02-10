const { forenameToInitial } = require('../utils')
const config = require('../config')

module.exports = ({ oauthApi }) => async (req, res, next) => {
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
  }
  next()
}

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

    res.locals.user = {
      ...res.locals.user,
      displayName: name,
      username,
    }

    res.locals.userRoles = req.session.userRoles
  }
  next()
}

module.exports = ({ oauthApi }) => async (req, res, next) => {
  if (!req.xhr) {
    if (!req.session.userDetails) {
      const userDetails = await oauthApi.currentUser(res.locals)

      req.session.userDetails = userDetails
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
  }
  next()
}

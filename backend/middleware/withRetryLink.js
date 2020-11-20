const withRetryLink = redirectUrl => (req, res, next) => {
  res.locals.redirectUrl = redirectUrl
  next()
}

module.exports = withRetryLink

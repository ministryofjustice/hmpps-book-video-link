const { serviceUnavailableMessage } = require('../common-messages')
const { logError } = require('../logError')

const errorHandler = (req, res, error, redirectUrl) => {
  logError(req.originalUrl, error, serviceUnavailableMessage)
  const pageData = {
    url: redirectUrl,
  }
  res.status(500)
  res.render('error.njk', pageData)
}

module.exports = errorHandler

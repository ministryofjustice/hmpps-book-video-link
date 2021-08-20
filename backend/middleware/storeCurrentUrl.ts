import { RequestHandler } from 'express'

const offenderNo = /[/][a-zA-Z][0-9]{4}[a-zA-Z]{2}/

function removeOffenderNoFromUrl(url) {
  return url.replace(offenderNo, '/:offenderNo')
}

export default function storeCurrentUrl(): RequestHandler {
  return (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + removeOffenderNoFromUrl(req.path),
      hostname: req.hostname,
    }
    next()
  }
}

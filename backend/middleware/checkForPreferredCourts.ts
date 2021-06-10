import { RequestHandler } from 'express'

export default function checkForPreferredCourts(): RequestHandler {
  return (req, res, next) => {
    if (res.locals.preferredCourts.length === 0) {
      return res.redirect('/courts-not-selected')
    }

    return next()
  }
}

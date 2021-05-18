import { RequestHandler } from 'express'

export default function checkForPreferredCourts(manageCourtsEnabled: boolean): RequestHandler {
  return (req, res, next) => {
    if (manageCourtsEnabled && res.locals.preferredCourts.length === 0) {
      return res.redirect('/courts-not-selected')
    }

    return next()
  }
}

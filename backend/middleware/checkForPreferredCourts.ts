import { RequestHandler } from 'express'

export default function checkForPreferredCourts(manageCourtsEnabled: boolean): RequestHandler {
  return async (req, res, next) => {
    if (manageCourtsEnabled && res.locals.preferredCourts.length === 0) {
      return res.render('courtsNotSelected.njk', {})
    }

    return next()
  }
}

import { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { logError } from '../logError'

export default function errorHandler(production: boolean) {
  return (error: HttpError, req: Request, res: Response, next: NextFunction): void => {
    logError(req.originalUrl, error, 'An error occurred')
    const pageData = {
      url: res.locals.redirectUrl || req.originalUrl,
      production,
    }
    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again.'
      : error.message
    res.locals.stack = production ? null : error.stack
    res.status(500)
    res.render('error.njk', pageData)
  }
}

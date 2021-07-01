import { RequestHandler } from 'express'

export type ValidationError = { text?: string; href: string }
export type Validator = (body: Record<string, string>) => ValidationError[]

export default (...validators: Validator[]): RequestHandler =>
  (req, res, next) => {
    const errors = validators.flatMap(validator => validator(req.body))
    if (errors.length) {
      req.errors = errors
    }
    next()
  }

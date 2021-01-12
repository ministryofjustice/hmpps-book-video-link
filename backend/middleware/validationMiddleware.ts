import { RequestHandler } from 'express'

type Validator = (body: Record<string, unknown>) => string[]

export default (validator: Validator): RequestHandler => (req, res, next) => {
  const errors = validator(req.body)
  if (errors.length) {
    req.errors = errors
  }
  next()
}

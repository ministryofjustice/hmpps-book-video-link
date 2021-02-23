import { RequestHandler } from 'express'

export type ValidationError = { text?: string; href: string }
export type Validator = (body: Record<string, string>) => ValidationError[]

export default (validator: Validator): RequestHandler => (req, res, next) => {
  const errors = validator(req.body)
  if (errors.length) {
    req.errors = errors
  }
  next()
}

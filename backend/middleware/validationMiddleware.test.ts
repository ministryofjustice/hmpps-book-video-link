import { Request, Response } from 'express'
import validationMiddleware from './validationMiddleware'
import type { ValidationError, Validator } from './validationMiddleware'

describe('Validation middleware', () => {
  let req
  const res = {} as Response
  const next = jest.fn()
  const error: ValidationError = { text: 'error message', href: 'error' }

  beforeEach(() => {
    jest.resetAllMocks()
    req = ({
      body: 'content',
    } as unknown) as Request
  })

  it('should add errors to request object when any are present', async () => {
    const alwaysFailsValidator: Validator = () => [error]
    validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(req.errors).toEqual([error])
    expect(next).toHaveBeenCalled()
  })

  it('should not add any errors to request object when no errors are present', async () => {
    const neverFailsValidator: Validator = () => []
    validationMiddleware(neverFailsValidator)(req, res, next)

    expect(req.errors).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should recieve a request body', async () => {
    const mockValidator: Validator = jest.fn().mockReturnValue([])
    validationMiddleware(mockValidator)(req, res, next)

    expect(mockValidator).toHaveBeenCalledWith(req.body)
  })
})

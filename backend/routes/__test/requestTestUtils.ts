import { NextFunction, Request, Response } from 'express'
import { ValidationError } from '../../middleware/validationMiddleware'

const exampleUserDetails = {
  username: 'COURT_USER',
  active: true,
  name: 'Court User',
  authSource: 'nomis',
  staffId: 123456,
  userId: '654321',
}

type RequestParams = {
  userDetails?: unknown
  params?: Record<string, string>
  body?: Record<string, string>
  errors?: ValidationError[]
}

export const mockRequest = ({
  userDetails = exampleUserDetails,
  params = {},
  body = {},
  errors = undefined,
}: RequestParams): jest.Mocked<Request> =>
  (({
    session: {
      userDetails,
    },
    params,
    flash: jest.fn().mockReturnValue([]),
    body,
    errors,
  } as unknown) as jest.Mocked<Request>)

export const mockResponse = (): jest.Mocked<Response> =>
  (({
    locals: { context: {} },
    send: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown) as jest.Mocked<Response>)

export const mockNext = (): NextFunction => jest.fn()

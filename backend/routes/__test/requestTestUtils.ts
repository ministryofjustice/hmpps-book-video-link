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
type CookieValues = Record<string, string>

type RequestParams = {
  userDetails?: unknown
  params?: Record<string, string>
  body?: Record<string, string>
  baseUrl?: string
  path?: string
  hostname?: string
  query?: Record<string, string>
  signedCookies?: Record<string, CookieValues>
  errors?: ValidationError[]
}

type ResponseParams = {
  locals?: unknown
}

export const mockRequest = ({
  userDetails = exampleUserDetails,
  params = {},
  query = {},
  body = {},
  signedCookies = {},
  baseUrl,
  path,
  hostname,
  errors = undefined,
}: RequestParams): jest.Mocked<Request> =>
  ({
    session: {
      userDetails,
    },
    signedCookies,
    query,
    params,
    flash: jest.fn().mockReturnValue([]),
    body,
    baseUrl,
    path,
    hostname,
    errors,
  } as unknown as jest.Mocked<Request>)

export const mockResponse = ({ locals = { context: {} } }: ResponseParams): jest.Mocked<Response> =>
  ({
    locals,
    sendStatus: jest.fn(),
    send: jest.fn(),
    contentType: jest.fn(),
    set: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as jest.Mocked<Response>)

export const mockNext = (): NextFunction => jest.fn()

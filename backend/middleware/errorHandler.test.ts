import { Request, Response } from 'express'
import errorHandler from './errorHandler'
import { logError } from '../logError'
import { serviceUnavailableMessage } from '../common-messages'

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('Error handling middleware', () => {
  const req = {
    originalUrl: 'http://localhost',
  } as Request
  const res = {
    status: jest.fn(),
    render: jest.fn(),
    locals: {} as Record<string, unknown>,
  }
  const error = new Error('error message')
  const production = false

  const handleErrorWhenRetryLinkIs = redirectUrl =>
    errorHandler(production)(error, req, ({ ...res, locals: { redirectUrl } } as unknown) as Response, null)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should log an error when an error is thrown', async () => {
    handleErrorWhenRetryLinkIs('/bookings')

    expect(logError).toHaveBeenCalledWith(req.originalUrl, error, serviceUnavailableMessage)
  })

  it('should handle an error when the retry link is overridden', async () => {
    handleErrorWhenRetryLinkIs('/bookings')

    expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/bookings', production })
  })

  it('should handle an error when there is no retry link', async () => {
    handleErrorWhenRetryLinkIs(null)

    expect(res.render).toHaveBeenCalledWith('error.njk', { url: 'http://localhost', production })
  })

  it('should produce a 500 status code when an error is thrown', async () => {
    handleErrorWhenRetryLinkIs('/bookings')

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('should not display error information in production', async () => {
    const response = ({ ...res, locals: { redirectUrl: '/bookings' } } as unknown) as Response
    errorHandler(true)(error, req, response, null)

    expect(response.locals.message).toMatch('Something went wrong. The error has been logged. Please try again.')
    expect(response.locals.stack).toEqual(null)
  })
})

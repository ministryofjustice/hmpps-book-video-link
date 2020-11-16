const errorHandler = require('./errorHandler')
const { logError } = require('../logError')
const { serviceUnavailableMessage } = require('../common-messages')

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('Error handling middleware', () => {
  const req = {
    originalUrl: 'http://localhost',
  }
  const res = {
    status: jest.fn(),
    render: jest.fn(),
  }
  const error = new Error('error message')
  const redirectUrl = '/bookings'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should throw and log an error with a 500 status code', async () => {
    await errorHandler(req, res, error, redirectUrl)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, error, serviceUnavailableMessage)

    expect(res.status).toHaveBeenCalledWith(500)

    expect(res.render).toHaveBeenCalledWith('error.njk', { url: redirectUrl })
  })
})

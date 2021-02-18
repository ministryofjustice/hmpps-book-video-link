import type { Request, Response } from 'express'

import CourtSelectionConfirmationController from './courtSelectionConfirmationController'

describe('video link is available controller', () => {
  let controller: CourtSelectionConfirmationController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  beforeEach(() => {
    controller = new CourtSelectionConfirmationController()
  })

  describe('view', () => {
    it('should display booking details when amending date and time', async () => {
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('manageCourts/courtSelectionConfirmation.njk', {})
    })
  })
})

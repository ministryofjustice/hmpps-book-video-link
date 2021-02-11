import type { Request, Response } from 'express'

import CourtSelectionConfirmationController from './courtSelectionConfirmationController'
import ManageCourtsService from '../../services/manageCourtsService'

jest.mock('../../services/manageCourtsService')

describe('video link is available controller', () => {
  const manageCourtsService = new ManageCourtsService(null) as jest.Mocked<ManageCourtsService>
  let controller: CourtSelectionConfirmationController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  beforeEach(() => {
    controller = new CourtSelectionConfirmationController(manageCourtsService)
  })

  describe('view', () => {
    it('should display booking details when amending date and time', async () => {
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('manageCourts/courtSelectionConfirmation.njk', {})
    })
  })
})

import { mockRequest, mockResponse } from '../__test/requestTestUtils'

import CourtSelectionConfirmationController from './courtSelectionConfirmationController'

describe('court selection confirmation controller', () => {
  let controller: CourtSelectionConfirmationController

  const req = mockRequest({})
  const res = mockResponse()

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

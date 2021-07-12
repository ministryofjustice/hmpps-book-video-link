import RoomNoLongerAvailableController from './RoomNoLongerAvailableController'

import { mockRequest, mockResponse } from '../../__test/requestTestUtils'

describe('Not available page', () => {
  const res = mockResponse({})

  let controller: RoomNoLongerAvailableController

  beforeEach(() => {
    controller = new RoomNoLongerAvailableController()
  })

  describe('view', () => {
    it('should render template with data', async () => {
      const req = mockRequest({
        params: {
          offenderNo: 'A12345',
          agencyId: 'MDI',
        },
      })

      await controller.view(req, res, null)

      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
      })
    })
  })
})

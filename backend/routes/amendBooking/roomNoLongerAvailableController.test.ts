import RoomNoLongerAvailableController from './roomNoLongerAvailableController'

import { mockRequest, mockResponse } from '../__test/requestTestUtils'

describe('No longer available page', () => {
  const res = mockResponse({})

  let controller: RoomNoLongerAvailableController

  beforeEach(() => {
    controller = new RoomNoLongerAvailableController()
  })

  describe('view', () => {
    it('should render template with data', async () => {
      const req = mockRequest({
        params: {
          bookingId: '123',
        },
      })

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('amendBooking/roomNoLongerAvailable.njk', {
        continueLink: '/change-video-link/123',
      })
    })
  })
})

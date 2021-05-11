import { mockRequest, mockResponse } from '../__test/requestTestUtils'

import CourtSelectionConfirmationController from './courtSelectionConfirmationController'
import ManageCourtsService from '../../services/manageCourtsService'

jest.mock('../../services/manageCourtsService')

describe('court selection confirmation controller', () => {
  const manageCourtsService = new ManageCourtsService(null, null) as jest.Mocked<ManageCourtsService>
  let controller: CourtSelectionConfirmationController

  const req = mockRequest({})
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

  const courtList = [
    {
      courtId: 'ABDRCT',
      courtName: 'Aberdare County Court',
      type: {
        courtType: 'COU',
        courtName: 'Aberdare County Court',
      },
      active: true,
    },
    {
      courtId: 'ABDRMC',
      courtName: 'Aberdare Mc',
      type: {
        courtType: 'MAG',
        courtName: 'Aberdare Mc',
      },
      active: true,
    },
    {
      courtId: 'ABDRYC',
      courtName: 'Aberdare Youth Court',
      type: {
        courtType: 'YTH',
        courtName: 'Aberdare Youth Court',
      },
      active: true,
    },
  ]

  beforeEach(() => {
    controller = new CourtSelectionConfirmationController(manageCourtsService)
  })

  describe('view', () => {
    it('should display a list the user preferred courts', async () => {
      manageCourtsService.getSelectedCourts.mockResolvedValue(courtList)
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('manageCourts/courtSelectionConfirmation.njk', { courts: courtList })
    })
  })
})

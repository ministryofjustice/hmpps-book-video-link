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
      id: 'ABDRCT',
      name: 'Aberdare County Court',
    },
    {
      id: 'ABDRMC',
      name: 'Aberdare Mc',
    },
    {
      id: 'ABDRYC',
      name: 'Aberdare Youth Court',
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

    it('should update user preferred courts in req.session to undefined triggering a new service call to update preferred courts in res.locals via current user middleware', async () => {
      manageCourtsService.getSelectedCourts.mockResolvedValue(courtList)
      await controller.view()(req, res, null)

      expect(req.session.preferredCourts).toStrictEqual(undefined)
    })
  })
})

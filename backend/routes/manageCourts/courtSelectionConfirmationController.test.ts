import type { CourtDto } from 'courtRegister'
import { Response } from 'express'
import { mockRequest } from '../__test/requestTestUtils'

import CourtSelectionConfirmationController from './courtSelectionConfirmationController'
import ManageCourtsService from '../../services/manageCourtsService'

jest.mock('../../services/manageCourtsService')

type UserPreferenceCourts = CourtDto & {
  isSelected?: boolean
}

describe('court selection confirmation controller', () => {
  const manageCourtsService = new ManageCourtsService(null, null) as jest.Mocked<ManageCourtsService>
  let controller: CourtSelectionConfirmationController

  const req = mockRequest({})
  const res = ({
    locals: { context: {}, user: { username: 'user_1' } },
    sendStatus: jest.fn(),
    send: jest.fn(),
    contentType: jest.fn(),
    set: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  const courtList = ([
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
  ] as unknown) as jest.Mocked<UserPreferenceCourts[]>

  beforeEach(() => {
    controller = new CourtSelectionConfirmationController(manageCourtsService)
  })

  describe('view', () => {
    it('should display a list the user preferred courts', async () => {
      manageCourtsService.getSortedCourts.mockResolvedValue(courtList)
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('manageCourts/courtSelectionConfirmation.njk', { courts: courtList })
    })
  })
})

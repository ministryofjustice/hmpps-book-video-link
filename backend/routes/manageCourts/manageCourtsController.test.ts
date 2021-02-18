import { Request, Response } from 'express'
import type { Agency } from 'prisonApi'

import ManageCourtsController from './manageCourtsController'
import ManageCourtsService from '../../services/manageCourtsService'

jest.mock('../../services/manageCourtsService')

describe('Manage courts controller', () => {
  const manageCourtsService = new ManageCourtsService(null) as jest.Mocked<ManageCourtsService>
  let controller: ManageCourtsController
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

  const courtList = ({
    A: [
      {
        active: true,
        agencyId: 'ABDRCT',
        agencyType: 'CRT',
        description: 'Aberdare County Court',
        longdescription: 'Aberdare County Court',
      },
      {
        active: true,
        agencyId: 'ABDRMC',
        agencyType: 'CRT',
        description: 'Aberdare Mc',
        longdescription: 'Aberdare Mc',
      },
      {
        active: true,
        agencyId: 'ABDRYC',
        agencyType: 'CRT',
        description: 'Aberdare Youth Court',
        longdescription: 'Aberdare Youth Court',
      },
    ],
  } as unknown) as Map<string, Agency[]>

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new ManageCourtsController(manageCourtsService)
  })

  describe('view', () => {
    const mockFlashState = ({ errors }) => (req.flash as any).mockReturnValueOnce(errors)

    describe('View page with no errors', () => {
      it('should display a list of courts', async () => {
        manageCourtsService.getCourtsByLetter.mockResolvedValue(courtList)
        mockFlashState({ errors: [] })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('manageCourts/manageCourts.njk', {
          courts: courtList,
          errors: [],
        })
      })
    })

    describe('View page with errors present', () => {
      it('should display validation for errors', async () => {
        manageCourtsService.getCourtsByLetter.mockResolvedValue(courtList)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('manageCourts/manageCourts.njk', {
          courts: courtList,
          errors: [{ text: 'error message', href: 'error' }],
        })
      })
    })
  })

  describe('submit', () => {
    it('should redirect to court selection confirmation page when no errors exist', async () => {
      manageCourtsService.getCourtsByLetter.mockResolvedValue(courtList)

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/court-list-updated')
    })

    describe('when errors are present', () => {
      beforeEach(() => {
        req.errors = [{ text: 'error message', href: 'error' }]
      })

      it('should place errors into flash', async () => {
        manageCourtsService.getCourtsByLetter.mockResolvedValue(courtList)
        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should redirect to same page', async () => {
        manageCourtsService.getCourtsByLetter.mockResolvedValue(courtList)

        await controller.submit()(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith('/manage-courts')
      })
    })
  })
})

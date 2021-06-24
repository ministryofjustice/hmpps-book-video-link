import ManageCourtsController from './manageCourtsController'
import ManageCourtsService, { UserPreferenceCourt } from '../../services/manageCourtsService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/manageCourtsService')

describe('Manage courts controller', () => {
  const manageCourtsService = new ManageCourtsService(null, null) as jest.Mocked<ManageCourtsService>
  let controller: ManageCourtsController

  const req = mockRequest({})
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

  const courtList = ({
    A: [
      {
        courtId: 'ABDRCT',
        courtName: 'Aberdare County Court',
        isSelected: true,
      },
      {
        courtId: 'ABDRMC',
        courtName: 'Aberdare Mc',
        isSelected: true,
      },
      {
        courtId: 'ABDRYC',
        courtName: 'Aberdare Youth Court',
        isSelected: true,
      },
    ],
  } as unknown) as Map<string, UserPreferenceCourt[]>

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new ManageCourtsController(manageCourtsService)
  })

  describe('view', () => {
    const mockFlashState = ({ errors }) => req.flash.mockReturnValueOnce(errors)

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

import StartController from './startController'
import LocationService from '../../services/locationService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/locationService')

describe('Request path Start controller', () => {
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: StartController

  const req = mockRequest({})
  const res = mockResponse()

  beforeEach(() => {
    jest.resetAllMocks()

    locationService.getVideoLinkEnabledPrisons.mockResolvedValue([{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    controller = new StartController(locationService)
  })

  describe('View', () => {
    const mockFlashState = ({ errors, input }) => req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(input)

    it('should make the correct calls for information and render the correct template', async () => {
      mockFlashState({ errors: [], input: [] })
      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBooking.njk', {
        errors: [],
        prisons: [
          {
            text: 'HMP Wandsworth',
            value: 'WWI',
            selected: false,
          },
        ],
      })
    })

    it('should render the correct template with user input when present', async () => {
      mockFlashState({
        errors: [],
        input: [
          {
            prison: 'WWI',
            date: '21/11/2020',
            startTimeHours: '11',
            startTimeMinutes: '20',
            endTimeHours: '11',
            endTimeMinutes: '40',
            postAppointmentRequired: 'yes',
            preAppointmentRequired: 'yes',
          },
        ],
      })
      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBooking.njk', {
        errors: [],
        prisons: [
          {
            text: 'HMP Wandsworth',
            value: 'WWI',
            selected: true,
          },
        ],
        formValues: {
          prison: 'WWI',
          date: '21/11/2020',
          startTimeHours: '11',
          startTimeMinutes: '20',
          endTimeHours: '11',
          endTimeMinutes: '40',
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
        },
      })
    })

    it('should call the location service with correct details', async () => {
      mockFlashState({ errors: [], input: [] })
      await controller.view()(req, res, null)
      expect(locationService.getVideoLinkEnabledPrisons).toHaveBeenCalledWith(res.locals)
    })

    describe('Submit', () => {
      req.body = {
        prison: 'test@test',
        date: '29/03/2019',
        startTimeHours: '22',
        startTimeMinutes: '05',
        endTimeHours: '23',
        endTimeMinutes: '05',
        comments: 'Test comment',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      }

      it('should stash the appointment details and redirect to select court page', async () => {
        await controller.submit()(req, res, null)

        expect(req.flash).toHaveBeenCalledWith(
          'requestBooking',
          expect.objectContaining({
            date: '29/03/2019',
            prison: 'test@test',
            startTime: '2019-03-29T22:05:00',
            endTime: '2019-03-29T23:05:00',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'no',
          })
        )

        expect(res.redirect).toHaveBeenCalledWith('/request-booking/select-court')
      })

      it('should stash errors and redirect to current page when errors present', async () => {
        req.errors = [{ text: 'error message', href: 'error' }]
        await controller.submit()(req, res, null)

        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
        expect(req.flash).toHaveBeenCalledWith('input', [req.body])

        expect(res.redirect).toHaveBeenCalledWith('/request-booking')
      })
    })
  })
})

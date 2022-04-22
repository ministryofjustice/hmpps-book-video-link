import OffenderDetailsController from './offenderDetailsController'
import LocationService from '../../services/locationService'
import NotificationService from '../../services/notificationService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/locationService')
jest.mock('../../services/notificationService')

describe('Offender details controller', () => {
  const locationService = new LocationService(null, null, null, null) as jest.Mocked<LocationService>
  const notificationService = new NotificationService(null, null, null) as jest.Mocked<NotificationService>

  let controller: OffenderDetailsController

  const req = mockRequest({})
  const res = mockResponse({})

  const mockFlashState = ({ errors, input }) => req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(input)

  beforeEach(() => {
    jest.resetAllMocks()

    locationService.getMatchingPrison.mockResolvedValue({
      agencyId: 'WWI',
      description: 'HMP Wandsworth',
    })

    locationService.getCourtEmailAddress.mockResolvedValue({ email: 'court@mail.com' })

    controller = new OffenderDetailsController(locationService, notificationService)
  })

  describe('View', () => {
    it('should render the correct template with errors and form values', async () => {
      const errors = [{ href: '#first-name', text: 'Enter a first name' }]
      mockFlashState({
        errors,
        input: [
          {
            lastName: 'doe',
          },
        ],
      })

      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('requestBooking/offenderDetails.njk', {
        errors,
        formValues: { lastName: 'doe' },
      })
    })
  })

  describe('Submit', () => {
    it('should redirect to current page when errors are present', async () => {
      const errors = [
        { text: 'Enter a first name', href: '#first-name' },
        { text: 'Enter a last name', href: '#last-name' },
        { text: 'Enter a date of birth', href: '#dobDay' },
      ]

      const request = mockRequest({ errors })
      request.flash.mockReturnValueOnce([])

      await controller.submit()(request, res, null)

      expect(request.flash).toHaveBeenCalledWith('requestBooking', {})
      expect(request.flash).toHaveBeenCalledWith('errors', [
        { text: 'Enter a first name', href: '#first-name' },
        { text: 'Enter a last name', href: '#last-name' },
        { text: 'Enter a date of birth', href: '#dobDay' },
      ])
      expect(request.flash).toHaveBeenCalledWith('input', {})
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/enter-offender-details')
    })

    it('should submit two emails, one for the prison and another for the current user', async () => {
      const details = {
        date: '01/01/2019',
        endTime: '2019-12-01T11:00:00',
        hearingLocation: 'London',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        prison: 'WWI',
        startTime: '2019-12-01T10:00:00',
        courtId: 'someCourtId',
      }
      req.flash.mockReturnValueOnce([details])

      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.submit()(req, res, null)

      const personalisation = {
        date: 'Tuesday 1 January 2019',
        startTime: '10:00',
        endTime: '11:00',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        dateOfBirth: '10 December 2019',
        firstName: 'John',
        hearingLocation: 'London',
        lastName: 'Doe',
        comments: 'test',
        prison: 'HMP Wandsworth',
        agencyId: 'WWI',
        courtEmailAddress: 'court@mail.com',
      }

      expect(locationService.getCourtEmailAddress).toHaveBeenLastCalledWith(res.locals, 'someCourtId')
      expect(notificationService.sendBookingRequestEmails).toHaveBeenCalledWith(
        res.locals,
        'COURT_USER',
        personalisation
      )
    })

    it('should stash appointment details and redirect to the confirmation page', async () => {
      const details = {
        date: '01/01/2019',
        endTime: '2019-12-01T11:00:00',
        hearingLocation: 'London',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        prison: 'WWI',
        startTime: '2019-12-01T10:00:00',
      }
      req.flash.mockReturnValueOnce([details])

      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.submit()(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
        date: 'Tuesday 1 January 2019',
        dateOfBirth: '10 December 2019',
        endTime: '11:00',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        prison: 'HMP Wandsworth',
        startTime: '10:00',
        hearingLocation: 'London',
        firstName: 'John',
        lastName: 'Doe',
        comments: 'test',
        agencyId: 'WWI',
        courtEmailAddress: 'court@mail.com',
      })
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })
})

import SelectCourtController from './selectCourtController'
import LocationService from '../../services/locationService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/locationService')

describe('Select court controller', () => {
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: SelectCourtController

  const req = mockRequest({})
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

  const mockFlashState = ({ errors, requestBooking }) =>
    req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(requestBooking)

  beforeEach(() => {
    jest.resetAllMocks()

    locationService.getMatchingPrison.mockResolvedValue({
      agencyId: 'WWI',
      description: 'HMP Wandsworth',
    })

    locationService.getVideoLinkEnabledCourts.mockResolvedValue([
      { value: 'LDNCOU', text: 'London County Court' },
      { value: 'YKCRN', text: 'York Crown Court' },
    ])

    controller = new SelectCourtController(locationService)
  })

  describe('View', () => {
    it('should stash correct values into flash', async () => {
      mockFlashState({
        errors: [],
        requestBooking: [
          {
            date: '01/01/3019',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            prison: 'WWI',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'yes',
          },
        ],
      })

      await controller.view()(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
        date: '01/01/3019',
        endTime: '3019-01-01T02:00:00',
        postAppointmentRequired: 'yes',
        postHearingStartAndEndTime: '02:00 to 02:20',
        preAppointmentRequired: 'no',
        preHearingStartAndEndTime: 'Not required',
        prison: 'WWI',
        startTime: '3019-01-01T01:00:00',
      })
    })

    it('should redirect to / if request booking details are missing from flash', async () => {
      mockFlashState({
        errors: [],
        requestBooking: [],
      })

      await controller.view()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    it('should render the correct template with the correct view model', async () => {
      mockFlashState({
        errors: [],
        requestBooking: [
          {
            date: '01/01/3019',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            prison: 'WWI',
            preAppointmentRequired: 'yes',
            postAppointmentRequired: 'yes',
          },
        ],
      })

      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('requestBooking/selectCourt.njk', {
        prisonDetails: {
          prison: 'HMP Wandsworth',
        },
        hearingDetails: {
          courtHearingEndTime: '02:00',
          courtHearingStartTime: '01:00',
          date: '1 January 3019',
        },
        prePostDetails: {
          'post-court hearing briefing': '02:00 to 02:20',
          'pre-court hearing briefing': '00:40 to 01:00',
        },
        hearingLocations: [
          {
            text: 'London County Court',
            value: 'LDNCOU',
          },
          {
            text: 'York Crown Court',
            value: 'YKCRN',
          },
        ],
        errors: [],
      })
    })

    it('should call the location service with correct details', async () => {
      const prison = 'WWI'
      mockFlashState({
        errors: [],
        requestBooking: [
          {
            date: '01/01/3019',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            prison: 'WWI',
            preAppointmentRequired: 'yes',
            postAppointmentRequired: 'yes',
          },
        ],
      })

      await controller.view()(req, res, null)

      expect(locationService.getVideoLinkEnabledCourts).toHaveBeenCalledWith(res.locals, res.locals.user.username)
      expect(locationService.getMatchingPrison).toHaveBeenCalledWith(res.locals, prison)
    })
  })

  describe('Submit', () => {
    it('should stash hearing location into flash and redirect to enter offender details', async () => {
      req.body = { courtId: 'LDNCOU' }
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ value: 'LDNCOU', text: 'London County Court' })
      mockFlashState({
        errors: [],
        requestBooking: [
          {
            date: '01/01/3019',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            prison: 'WWI',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'yes',
          },
        ],
      })
      await controller.submit()(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
        hearingLocation: 'London County Court',
      })
      expect(res.redirect('/request-booking/enter-offender-details'))
    })

    it('should stash errors and redirect to current page when errors present', async () => {
      req.errors = [{ text: 'error message', href: 'error' }]
      mockFlashState({
        errors: req.errors,
        requestBooking: [
          {
            date: '01/01/3019',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            prison: 'WWI',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'yes',
          },
        ],
      })
      await controller.submit()(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('errors', req.errors)

      expect(res.redirect).toHaveBeenCalledWith('/request-booking/select-court')
    })
  })
})

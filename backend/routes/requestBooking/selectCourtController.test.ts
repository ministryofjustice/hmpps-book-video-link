import { Request, Response } from 'express'

import SelectCourtController from './selectCourtController'
import LocationService from '../../services/locationService'

jest.mock('../../services/locationService')

process.env.VIDEO_LINK_ENABLED_FOR = 'WWI'
process.env.WANDSWORTH_VLB_EMAIL = 'test@justice.gov.uk'

describe('Select court controller', () => {
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: SelectCourtController

  const req = ({
    body: {},
    originalUrl: 'http://localhost',
    session: {
      userDetails: {
        name: 'Test User',
        username: 'testUsername',
      },
      data: {},
    },
    params: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  const mockFlashState = ({ errors, requestBooking }) =>
    (req.flash as any).mockReturnValueOnce(errors).mockReturnValueOnce(requestBooking)

  beforeEach(() => {
    jest.resetAllMocks()

    locationService.getMatchingPrison.mockResolvedValue({
      agencyId: 'WWI',
      description: 'HMP Wandsworth',
    })

    locationService.getVideoLinkEnabledCourts.mockResolvedValue([
      { value: 'London', text: 'London' },
      { value: 'York', text: 'York' },
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
            text: 'London',
            value: 'London',
          },
          {
            text: 'York',
            value: 'York',
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

      expect(locationService.getVideoLinkEnabledCourts).toHaveBeenCalledWith(res.locals)
      expect(locationService.getMatchingPrison).toHaveBeenCalledWith(res.locals, prison)
    })
  })

  describe('Submit', () => {
    it('should stash hearing location into flash and redirect to enter offender details', async () => {
      req.body = { hearingLocation: 'London' }
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
        hearingLocation: 'London',
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

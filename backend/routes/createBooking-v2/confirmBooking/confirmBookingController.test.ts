import moment from 'moment'

import { Agency, InmateDetail } from 'prisonApi'

import ConfirmBookingController from './confirmBookingController'
import config from '../../../config'
import { BookingService, LocationService } from '../../../services'
import { DATE_TIME_FORMAT_SPEC } from '../../../shared/dateHelpers'
import { mockNext, mockRequest, mockResponse } from '../../__test/requestTestUtils'
import { PrisonApi } from '../../../api'
import { RoomFinder } from '../../../services/roomFinder'

jest.mock('../../../api/prisonApi')
jest.mock('../../../services')

describe('Select court appointment rooms', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const bookingService = new BookingService(null, null, null, null, null) as jest.Mocked<BookingService>
  const locationService = new LocationService(null, null, null) as jest.Mocked<LocationService>

  let controller: ConfirmBookingController

  let req
  const res = mockResponse({ locals: { user: { username: 'USER-1' } } })
  const next = mockNext()

  beforeEach(() => {
    jest.resetAllMocks()

    req = mockRequest({
      params: { agencyId: 'WWI', offenderNo: 'A12345' },
      signedCookies: {
        'booking-creation': {
          courtId: 'LEEMC',
          bookingId: '123456',
          date: '2017-11-10T00:00:00',
          postRequired: 'true',
          preRequired: 'true',
          endTime: '2017-11-10T14:00:00',
          startTime: '2017-11-10T11:00:00',
          mainLocation: '2',
          preLocation: '1',
          postLocation: '3',
        },
      },
    })

    req.flash.mockReturnValue([])

    bookingService.create.mockResolvedValue(123)
    prisonApi.getPrisonerDetails.mockResolvedValue({ firstName: 'BOB', lastName: 'SMITH' } as InmateDetail)
    prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Leeds' } as Agency)
    locationService.getVideoLinkEnabledCourt.mockResolvedValue({ value: 'LEEMC', text: 'LEEDS' })
    locationService.createRoomFinder.mockResolvedValue(
      new RoomFinder([
        { locationId: 1, description: 'Room 1' },
        { locationId: 2, description: 'Room 2' },
        { locationId: 3, description: 'Room 3' },
      ])
    )

    controller = new ConfirmBookingController(locationService, prisonApi, bookingService)
  })

  describe('view', () => {
    it('should return locations', async () => {
      const { view } = controller

      await view(req, res, next)

      expect(res.render).toHaveBeenCalledWith('createBooking-v2/confirmBooking.njk', {
        details: {
          'Post-court hearing briefing': '14:00 to 14:15',
          'Pre-court hearing briefing': '10:45 to 11:00',
          'Prison room for post-court hearing briefing': 'Room 3',
          'Prison room for pre-court hearing briefing': 'Room 1',
          courtHearingEndTime: '14:00',
          courtHearingStartTime: '11:00',
          date: '10 November 2017',
          prisonRoomForCourtHearing: 'Room 2',
        },
        errors: [],
        form: {},
        offender: { court: 'LEEDS', name: 'Bob Smith', prison: 'Leeds' },
      })
    })

    it('should call services correctly', async () => {
      const { view } = controller

      await view(req, res, next)

      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'WWI')
      expect(prisonApi.getPrisonerDetails).toHaveBeenCalledWith(res.locals, 'A12345')
      expect(locationService.getVideoLinkEnabledCourt).toHaveBeenCalledWith(res.locals, 'LEEMC', 'USER-1')
      expect(locationService.createRoomFinder).toHaveBeenCalledWith(res.locals, 'WWI')
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      res.redirect = jest.fn()
      config.notifications.emails.WWI.omu = 'omu@prison.com'
      config.notifications.emails.WWI.vlb = 'vlb@prison.com'
    })

    it('should redirect back when errors in request', async () => {
      const { submit } = controller

      const reqWithErrors = mockRequest({
        params: { agencyId: 'WWI', offenderNo: 'A12345' },
        body: {
          comment: 'Test',
        },
        errors: [{ href: '#preLocation' }],
      })

      await submit(reqWithErrors, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/WWI/offenders/A12345/add-court-appointment/select-rooms')
      expect(bookingService.create).not.toHaveBeenCalled()
    })

    it('should redirect to confirmation page', async () => {
      const { submit } = controller

      req.body = {
        comment: 'Test',
      }

      await submit(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    it('should redirect to confirmation page if no pre or post rooms are required', async () => {
      const { submit } = controller

      req.body = {
        comment: 'Test',
      }

      await submit(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment/123')
    })

    describe('should call the booking service with correct details', () => {
      it('with all fields ', async () => {
        const { submit } = controller

        req.body = {
          comment: 'Test',
        }

        await submit(req, res, next)

        expect(bookingService.create).toBeCalledWith(res.locals, 'COURT_USER', {
          agencyId: 'WWI',
          courtId: 'LEEMC',
          comment: 'Test',
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          offenderNo: 'A12345',
          pre: 1,
          main: 2,
          post: 3,
        })
      })

      it('with only mandatory fields ', async () => {
        const { submit } = controller

        await submit(req, res, next)

        expect(bookingService.create).toBeCalledWith(res.locals, 'COURT_USER', {
          agencyId: 'WWI',
          courtId: 'LEEMC',
          comment: undefined,
          mainEndTime: moment('2017-11-10T14:00:00', DATE_TIME_FORMAT_SPEC, true),
          mainStartTime: moment('2017-11-10T11:00:00', DATE_TIME_FORMAT_SPEC, true),
          offenderNo: 'A12345',
          pre: 1,
          main: 2,
          post: 3,
        })
      })
    })

    it('cookie is cleared on successful submit ', async () => {
      const { submit } = controller

      await submit(req, res, next)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-creation', expect.any(Object))
    })
  })
})

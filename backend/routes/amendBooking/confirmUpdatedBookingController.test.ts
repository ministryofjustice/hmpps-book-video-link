import moment from 'moment'
import { Court } from 'whereaboutsApi'
import CheckAndConfirmYourBookingController from './confirmUpdatedBookingController'
import { BookingService, LocationService } from '../../services'
import { BookingDetails } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'
import { RoomFinder } from '../../services/roomFinder'

jest.mock('../../services')

describe('Confirm updated booking controller', () => {
  const bookingService = new BookingService(null, null, null, null, null) as jest.Mocked<BookingService>
  const locationService = new LocationService(null, null, null) as jest.Mocked<LocationService>
  let controller: CheckAndConfirmYourBookingController

  const req = mockRequest({ params: { bookingId: '12' } })
  const res = mockResponse({})

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    courtId: 'CLDN',
    dateDescription: '20 November 2020',
    date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
    offenderNo: 'A123AA',
    prisonerName: 'John Doe',
    prisonName: 'some prison',
    prisonBookingId: 1,
    comments: 'some comment',
    preDetails: {
      prisonRoom: 'vcc room 2',
      startTime: '17:45',
      endTime: '18:00',
      description: 'vcc room 2 - 17:40 to 18:00',
      locationId: 2,
    },
    mainDetails: {
      prisonRoom: 'vcc room 1',
      startTime: '18:00',
      endTime: '19:00',
      description: 'vcc room 1 - 18:00 to 19:00',
      locationId: 1,
    },
    postDetails: {
      prisonRoom: 'vcc room 3',
      startTime: '19:00',
      endTime: '19:15',
      description: 'vcc room 3 - 19:00 to 19:20',
      locationId: 3,
    },
  }

  const court: Court = {
    id: 'CLDN',
    name: 'City of London',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    locationService.createRoomFinder.mockResolvedValue(
      new RoomFinder([
        { locationId: 1, description: 'vcc room 1' },
        { locationId: 2, description: 'vcc room 2' },
        { locationId: 3, description: 'vcc room 3' },
      ])
    )
    controller = new CheckAndConfirmYourBookingController(bookingService, locationService)

    req.signedCookies = {
      'booking-update': {
        agencyId: 'WWI',
        courtId: 'CLDN',
        date: '2020-11-20T00:00:00',
        startTime: '2020-11-20T18:00:00',
        endTime: '2020-11-20T19:00:00',
        preLocation: '2',
        mainLocation: '1',
        postLocation: '3',
        preRequired: 'true',
        postRequired: 'true',
      },
    }
  })

  describe('view', () => {
    const mockFlashState = ({ errors, input }) => req.flash.mockReturnValueOnce(errors).mockReturnValueOnce(input)

    it('should call services correctly', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      locationService.getVideoLinkEnabledCourt.mockResolvedValue(court)
      mockFlashState({ errors: [], input: [] })

      await controller.view()(req, res, null)
      expect(bookingService.get).toHaveBeenCalledWith(res.locals, 12)
      expect(locationService.getVideoLinkEnabledCourt).toHaveBeenCalledWith(res.locals, 'CLDN')
      expect(locationService.createRoomFinder).toHaveBeenCalledWith(res.locals, 'WWI')
    })

    describe('View page with no errors', () => {
      it('should display booking details', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        locationService.getVideoLinkEnabledCourt.mockResolvedValue(court)
        mockFlashState({ errors: [], input: [] })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/confirmUpdatedBooking.njk', {
          bookingId: '12',
          update: {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
            endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
            mainLocation: 1,
            postLocation: 3,
            postRequired: true,
            preLocation: 2,
            preRequired: true,
            startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
          },
          bookingDetails: {
            details: {
              name: 'John Doe',
              prison: 'some prison',
              courtLocation: 'City of London',
            },
            hearingDetails: {
              date: '20 November 2020',
              mainCourtHearingTime: '18:00 to 19:00',
              prisonRoomForCourtHearing: 'vcc room 1',
              'pre-court hearing briefing': '17:45 to 18:00',
              'prison room for pre-court hearing briefing': 'vcc room 2',
              'post-court hearing briefing': '19:00 to 19:15',
              'prison room for post-court hearing briefing': 'vcc room 3',
            },
          },
          changeBookingLink: '/change-video-link/12',
          comment: 'some comment',
          errors: [],
        })
      })
    })

    describe('View page with errors present', () => {
      it('should display validation for errors', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        locationService.getVideoLinkEnabledCourt.mockResolvedValue(court)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [
            {
              comment: 'another comment',
            },
          ],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/confirmUpdatedBooking.njk', {
          bookingId: '12',
          update: {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
            endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
            mainLocation: 1,
            postLocation: 3,
            postRequired: true,
            preLocation: 2,
            preRequired: true,
            startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
          },
          bookingDetails: {
            details: {
              name: 'John Doe',
              prison: 'some prison',
              courtLocation: 'City of London',
            },
            hearingDetails: {
              date: '20 November 2020',
              mainCourtHearingTime: '18:00 to 19:00',
              prisonRoomForCourtHearing: 'vcc room 1',
              'pre-court hearing briefing': '17:45 to 18:00',
              'prison room for pre-court hearing briefing': 'vcc room 2',
              'post-court hearing briefing': '19:00 to 19:15',
              'prison room for post-court hearing briefing': 'vcc room 3',
            },
          },
          changeBookingLink: '/change-video-link/12',
          comment: 'another comment',
          errors: [{ text: 'error message', href: 'error' }],
        })
      })

      it('When there is no user input', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        locationService.getVideoLinkEnabledCourt.mockResolvedValue(court)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/confirmUpdatedBooking.njk', {
          bookingId: '12',
          update: {
            agencyId: 'WWI',
            courtId: 'CLDN',
            date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
            endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
            mainLocation: 1,
            postLocation: 3,
            postRequired: true,
            preLocation: 2,
            preRequired: true,
            startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
          },
          bookingDetails: {
            details: {
              name: 'John Doe',
              prison: 'some prison',
              courtLocation: 'City of London',
            },
            hearingDetails: {
              date: '20 November 2020',
              mainCourtHearingTime: '18:00 to 19:00',
              prisonRoomForCourtHearing: 'vcc room 1',
              'pre-court hearing briefing': '17:45 to 18:00',
              'prison room for pre-court hearing briefing': 'vcc room 2',
              'post-court hearing briefing': '19:00 to 19:15',
              'prison room for post-court hearing briefing': 'vcc room 3',
            },
          },
          changeBookingLink: '/change-video-link/12',
          comment: 'some comment',
          errors: [{ text: 'error message', href: 'error' }],
        })
      })
    })
  })

  describe('submit', () => {
    it('should redirect to booking details confirmation page when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/video-link-change-confirmed/12`)
    })

    it('Redirect when no longer any availability for date/time', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('NOT_AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/room-no-longer-available/12`)
    })

    it('should submit perform an update', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      req.body = { comment: 'A comment' }

      await controller.submit()(req, res, null)

      expect(bookingService.update).toHaveBeenCalledWith(res.locals, 'COURT_USER', 12, {
        comment: 'A comment',
        agencyId: 'WWI',
        courtId: 'CLDN',
        date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        preLocation: 2,
        mainLocation: 1,
        postLocation: 3,
        preRequired: true,
        postRequired: true,
      })
    })

    it('should clear cookie when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      bookingService.update.mockResolvedValue('AVAILABLE')

      await controller.submit()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-update', expect.anything())
    })

    describe('when errors are present', () => {
      beforeEach(() => {
        req.errors = [{ text: 'error message', href: 'error' }]
      })

      it('should place errors into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should place input into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('input', req.body)
      })

      it('should redirect to same page', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/confirm-updated-booking/12`)
      })
    })
  })
})

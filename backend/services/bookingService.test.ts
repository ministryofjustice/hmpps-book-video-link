import type { Location, InmateDetail } from 'prisonApi'
import moment from 'moment'
import createError from 'http-errors'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import NotificationService from './notificationService'
import { BookingDetails } from './model'
import BookingService from './bookingService'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'
import AvailabilityCheckService from './availabilityCheckService'
import LocationService from './locationService'

import { RoomFinder } from './roomFinder'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')
jest.mock('./availabilityCheckService')
jest.mock('./locationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const notificationService = new NotificationService(null, null, null) as jest.Mocked<NotificationService>
const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
const locationService = new LocationService(null, null, null) as jest.Mocked<LocationService>

const offenderDetails = {
  bookingId: 789,
  firstName: 'john',
  lastName: 'doe',
  offenderNo: 'A1234AA',
} as InmateDetail

const agencyDetail = {
  active: true,
  agencyId: 'WWI',
  agencyType: '',
  description: 'some prison',
  longDescription: 'some prison',
}

const room = (i, description = `Vcc Room ${i}`) =>
  ({
    description,
    locationId: i,
  } as Location)

const bookingDetail: BookingDetails = {
  agencyId: 'WWI',
  offenderNo: 'A1234AA',
  comments: 'some comment',
  courtLocation: 'City of London',
  courtId: 'CLDN',
  dateDescription: '20 November 2020',
  date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC),
  prisonBookingId: 789,
  prisonName: 'some prison',
  prisonerName: 'John Doe',
  videoBookingId: 1234,
  preDetails: {
    description: 'Vcc Room 3 - 17:45 to 18:00',
    endTime: '18:00',
    prisonRoom: 'Vcc Room 3',
    startTime: '17:45',
    locationId: 3,
  },
  mainDetails: {
    description: 'Vcc Room 1 - 18:00 to 19:00',
    endTime: '19:00',
    prisonRoom: 'Vcc Room 1',
    startTime: '18:00',
    locationId: 1,
  },
  postDetails: {
    description: 'Vcc Room 2 - 19:00 to 19:15',
    endTime: '19:15',
    prisonRoom: 'Vcc Room 2',
    startTime: '19:00',
    locationId: 2,
  },
}

describe('Booking service', () => {
  const context = {}
  let service: BookingService

  beforeEach(() => {
    locationService.createRoomFinder.mockImplementation(
      async (ctx, agencyId) => new RoomFinder(await whereaboutsApi.getRooms(ctx, agencyId))
    )

    service = new BookingService(
      prisonApi,
      whereaboutsApi,
      notificationService,
      availabilityCheckService,
      locationService
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Find', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      courtId: 'CLDN',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:15:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:45:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should find booking details successfully when a booking exists', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])

      const result = await service.find(context, 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(whereaboutsApi.getRooms).toHaveBeenCalledTimes(1)
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'WWI')

      expect(result).toStrictEqual(bookingDetail)
    })

    it('Should return undefined when a booking does not exists and error status is 404', async () => {
      const error = createError(404, 'This booking does not exist')
      whereaboutsApi.getVideoLinkBooking.mockRejectedValue(error)

      const result = await service.find(context, 1)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1)

      expect(result).toStrictEqual(undefined)
    })

    it('Should return throw an error when error status something other than 404', async () => {
      const error = createError(500, 'Internal server error')
      whereaboutsApi.getVideoLinkBooking.mockRejectedValue(error)

      await expect(service.find(context, 1)).rejects.toThrowError(error)
    })
  })

  describe('Create', () => {
    beforeEach(() => {
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      whereaboutsApi.getCourtEmail.mockResolvedValue({ email: 'court@supportEmail.com' })
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonerDetails.mockResolvedValue({
        bookingId: 1000,
        firstName: 'Jim',
        lastName: 'Bob',
      } as InmateDetail)
      whereaboutsApi.createVideoLinkBooking.mockResolvedValue(11)
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('AVAILABLE')
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'City of London', id: 'CLDN' })
    })

    describe('Creating a booking with all fields', () => {
      it('booking with all fields created', async () => {
        const videoBookingId = await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          courtId: 'CLDN',
          comment: 'some comment',
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          pre: 1,
          main: 2,
          post: 3,
        })

        expect(videoBookingId).toBe(11)
        expect(whereaboutsApi.getCourtEmail).toBeCalledWith(context, 'CLDN')
        expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
          bookingId: 1000,
          courtId: 'CLDN',
          comment: 'some comment',
          madeByTheCourt: true,
          pre: {
            startTime: '2020-11-20T17:45:00',
            endTime: '2020-11-20T18:00:00',
            locationId: 1,
          },
          main: {
            locationId: 2,
            startTime: '2020-11-20T18:00:00',
            endTime: '2020-11-20T19:00:00',
          },
          post: {
            startTime: '2020-11-20T19:00:00',
            endTime: '2020-11-20T19:15:00',
            locationId: 3,
          },
        })
      })

      it('email sent when all fields provided', async () => {
        const videoBookingId = await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          courtId: 'CLDN',
          comment: 'some comment',
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          pre: 1,
          main: 2,
          post: 3,
        })

        expect(videoBookingId).toBe(11)

        expect(notificationService.sendBookingCreationEmails).toHaveBeenCalledWith(context, 'USER-1', {
          agencyId: 'MDI',
          court: 'City of London',
          prison: 'some prison',
          comment: 'some comment',
          prisonerName: 'Jim Bob',
          date: moment('2020-11-20T18:00:00'),
          offenderNo: 'AA1234AA',
          preDetails: 'Vcc Room 1 - 17:45 to 18:00',
          mainDetails: 'Vcc Room 2 - 18:00 to 19:00',
          postDetails: 'Vcc Room 3 - 19:00 to 19:15',
          courtEmailAddress: 'court@supportEmail.com',
        })
      })
      it('availability check service called correctly', async () => {
        await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          courtId: 'CLDN',
          comment: 'some comment',
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          pre: 1,
          main: 2,
          post: 3,
        })

        expect(availabilityCheckService.getAvailabilityStatus).toHaveBeenCalledWith(context, {
          agencyId: 'MDI',
          date: moment('2020-11-20T18:00:00'),
          endTime: moment('2020-11-20T19:00:00'),
          mainLocation: 2,
          postLocation: 3,
          preLocation: 1,
          startTime: moment('2020-11-20T18:00:00'),
        })
      })

      it('when rooms no longer available', async () => {
        availabilityCheckService.getAvailabilityStatus.mockResolvedValue('NOT_AVAILABLE')

        const result = await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          courtId: 'CLDN',
          comment: 'some comment',
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          pre: 1,
          main: 2,
          post: 3,
        })

        expect(result).toBe(false)
        expect(whereaboutsApi.createVideoLinkBooking).not.toHaveBeenCalled()
        expect(notificationService.sendBookingCreationEmails).not.toHaveBeenCalled()
      })
    })

    describe('Creating a booking with only mandatory fields', () => {
      it('booking with only mandatory fields created', async () => {
        await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          courtId: 'CLDN',
          comment: undefined,
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          main: 2,
          pre: undefined,
          post: undefined,
        })

        expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
          bookingId: 1000,
          courtId: 'CLDN',
          madeByTheCourt: true,
          main: {
            locationId: 2,
            startTime: '2020-11-20T18:00:00',
            endTime: '2020-11-20T19:00:00',
          },
        })
      })
    })

    it('email sent when only mandatory fields provided', async () => {
      await service.create(context, 'USER-1', {
        offenderNo: 'AA1234AA',
        agencyId: 'MDI',
        courtId: 'CLDN',
        comment: undefined,
        mainStartTime: moment('2020-11-20T18:00:00'),
        mainEndTime: moment('2020-11-20T19:00:00'),
        pre: undefined,
        main: 2,
        post: undefined,
      })

      expect(notificationService.sendBookingCreationEmails).toHaveBeenCalledWith(context, 'USER-1', {
        agencyId: 'MDI',
        court: 'City of London',
        prison: 'some prison',
        comment: undefined,
        prisonerName: 'Jim Bob',
        date: moment('2020-11-20T18:00:00'),
        offenderNo: 'AA1234AA',
        postDetails: undefined,
        mainDetails: 'Vcc Room 2 - 18:00 to 19:00',
        preDetails: undefined,
        courtEmailAddress: 'court@supportEmail.com',
      })
    })

    it('availability check service called correctly', async () => {
      await service.create(context, 'USER-1', {
        offenderNo: 'AA1234AA',
        agencyId: 'MDI',
        courtId: 'CLDN',
        comment: undefined,
        mainStartTime: moment('2020-11-20T18:00:00'),
        mainEndTime: moment('2020-11-20T19:00:00'),
        pre: undefined,
        main: 2,
        post: undefined,
      })

      expect(availabilityCheckService.getAvailabilityStatus).toHaveBeenCalledWith(context, {
        agencyId: 'MDI',
        date: moment('2020-11-20T18:00:00'),
        endTime: moment('2020-11-20T19:00:00'),
        mainLocation: 2,
        postLocation: undefined,
        preLocation: undefined,
        startTime: moment('2020-11-20T18:00:00'),
      })
    })

    it('when rooms no longer available', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('NOT_AVAILABLE')

      const result = await service.create(context, 'USER-1', {
        offenderNo: 'AA1234AA',
        agencyId: 'MDI',
        courtId: 'CLDN',
        comment: undefined,
        mainStartTime: moment('2020-11-20T18:00:00'),
        mainEndTime: moment('2020-11-20T19:00:00'),
        pre: undefined,
        main: 2,
        post: undefined,
      })

      expect(result).toBe(false)
      expect(whereaboutsApi.createVideoLinkBooking).not.toHaveBeenCalled()
      expect(notificationService.sendBookingCreationEmails).not.toHaveBeenCalled()
    })
  })

  describe('Get Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      courtId: 'CLDN',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:15:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:45:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should get booking details successfully', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])

      const result = await service.get(context, 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(whereaboutsApi.getRooms).toHaveBeenCalledTimes(1)
      expect(whereaboutsApi.getRooms).toHaveBeenCalledWith(context, 'WWI')

      expect(result).toStrictEqual(bookingDetail)
    })
  })

  describe('Update', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      courtId: 'CLDN',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:15:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:45:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should call whereaboutsApi correctly when updating a comment', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'City of London', id: 'CLDN' })

      await service.updateComments(context, 'A_USER', 1234, 'another comment')

      expect(whereaboutsApi.updateVideoLinkBookingComment).toHaveBeenCalledWith(context, 1234, 'another comment')
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        ...bookingDetail,
        comments: 'another comment',
        preDescription: 'Vcc Room 3 - 17:45 to 18:00',
        mainDescription: 'Vcc Room 1 - 18:00 to 19:00',
        postDescription: 'Vcc Room 2 - 19:00 to 19:15',
      })
      expect(whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.updateVideoLinkBookingComment.mock.invocationCallOrder[0]
      )
    })

    it('Should call whereaboutsApi correctly when updating a comment even if notification service fails', async () => {
      notificationService.sendBookingUpdateEmails.mockRejectedValue(new Error())

      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'City of London', id: 'CLDN' })

      await service.updateComments(context, 'A_USER', 1234, 'another comment')

      expect(whereaboutsApi.updateVideoLinkBookingComment).toHaveBeenCalledWith(context, 1234, 'another comment')
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        ...bookingDetail,
        comments: 'another comment',
        preDescription: 'Vcc Room 3 - 17:45 to 18:00',
        mainDescription: 'Vcc Room 1 - 18:00 to 19:00',
        postDescription: 'Vcc Room 2 - 19:00 to 19:15',
      })
      expect(whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.updateVideoLinkBookingComment.mock.invocationCallOrder[0]
      )
    })

    it('Should call whereaboutsApi correctly when updating all appointments', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'City of London', id: 'CLDN' })

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        courtId: 'CLDN',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        preLocation: 1,
        mainLocation: 2,
        postLocation: 3,
        preRequired: true,
        postRequired: true,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        courtId: 'CLDN',
        comment: 'A comment',
        pre: { locationId: 1, startTime: '2020-11-20T08:45:00', endTime: '2020-11-20T09:00:00' },
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
        post: { locationId: 3, startTime: '2020-11-20T10:00:00', endTime: '2020-11-20T10:15:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        agencyId: 'WWI',
        courtLocation: 'City of London',
        dateDescription: '20 November 2020',
        offenderNo: 'A1234AA',
        comments: 'A comment',
        prisonName: 'some prison',
        prisonerName: 'John Doe',
        preDescription: 'Vcc Room 1 - 08:45 to 09:00',
        mainDescription: 'Vcc Room 2 - 09:00 to 10:00',
        postDescription: 'Vcc Room 3 - 10:00 to 10:15',
      })
      expect(whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.updateVideoLinkBooking.mock.invocationCallOrder[0]
      )
    })

    it('Should call whereaboutsApi correctly when updating mandatory appointment', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'City of London', id: 'CLDN' })

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        courtId: 'CLDN',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
        preRequired: false,
        postRequired: false,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        courtId: 'CLDN',
        comment: 'A comment',
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        agencyId: 'WWI',
        courtLocation: 'City of London',
        dateDescription: '20 November 2020',
        offenderNo: 'A1234AA',
        comments: 'A comment',
        prisonName: 'some prison',
        prisonerName: 'John Doe',
        preDescription: undefined,
        mainDescription: 'Vcc Room 2 - 09:00 to 10:00',
        postDescription: undefined,
      })

      expect(whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.updateVideoLinkBooking.mock.invocationCallOrder[0]
      )
    })

    it('does not perform update when no availability', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('NOT_AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        courtId: 'CLDN',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
        preRequired: false,
        postRequired: false,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).not.toHaveBeenCalled()
    })

    it('Should pass updated court to notification service when updating the court of a booking', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'Westminster Crown Court', id: 'WMRCN' })

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        courtId: 'WMRCN',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
        preRequired: false,
        postRequired: false,
      })

      expect(locationService.getVideoLinkEnabledCourt).toHaveBeenCalledWith(context, 'WMRCN')
      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        courtId: 'WMRCN',
        comment: 'A comment',
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        agencyId: 'WWI',
        courtLocation: 'Westminster Crown Court',
        dateDescription: '20 November 2020',
        offenderNo: 'A1234AA',
        comments: 'A comment',
        prisonName: 'some prison',
        prisonerName: 'John Doe',
        preDescription: undefined,
        mainDescription: 'Vcc Room 2 - 09:00 to 10:00',
        postDescription: undefined,
      })
    })

    it('Should complete when notification service fails', async () => {
      notificationService.sendBookingUpdateEmails.mockRejectedValue(new Error())

      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      locationService.getVideoLinkEnabledCourt.mockResolvedValue({ name: 'Westminster Crown Court', id: 'WMRCN' })

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        courtId: 'WMRCN',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
        preRequired: false,
        postRequired: false,
      })

      expect(locationService.getVideoLinkEnabledCourt).toHaveBeenCalledWith(context, 'WMRCN')
      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        courtId: 'WMRCN',
        comment: 'A comment',
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        agencyId: 'WWI',
        courtLocation: 'Westminster Crown Court',
        dateDescription: '20 November 2020',
        offenderNo: 'A1234AA',
        comments: 'A comment',
        prisonName: 'some prison',
        prisonerName: 'John Doe',
        preDescription: undefined,
        mainDescription: 'Vcc Room 2 - 09:00 to 10:00',
        postDescription: undefined,
      })
    })
  })

  describe('Delete Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      courtId: 'CLDN',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:15:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:45:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should call whereaboutsApi and PrisonApi correctly when deleting a booking', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      whereaboutsApi.getCourtEmail.mockResolvedValue({ email: 'court@supportEmail.com' })

      await service.delete(context, 'A_USER', 1234)

      expect(whereaboutsApi.getCourtEmail).toHaveBeenCalledWith(context, videoLinkBooking.courtId)
      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)
      expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(notificationService.sendCancellationEmails).toHaveBeenCalledWith(context, 'A_USER', {
        ...bookingDetail,
        courtEmailAddress: 'court@supportEmail.com',
      })
    })

    it('Should call whereaboutsApi and PrisonApi correctly when deleting a booking even when  notification service fails', async () => {
      notificationService.sendCancellationEmails.mockRejectedValue(new Error())

      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])
      whereaboutsApi.getCourtEmail.mockResolvedValue({ email: 'court@supportEmail.com' })

      await service.delete(context, 'A_USER', 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)
      expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(notificationService.sendCancellationEmails).toHaveBeenCalledWith(context, 'A_USER', {
        ...bookingDetail,
        courtEmailAddress: 'court@supportEmail.com',
      })
    })

    it('Should return the offender identifiers when deleting a booking', () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      whereaboutsApi.getRooms.mockResolvedValue([room(1), room(2), room(3)])

      return expect(service.delete(context, 'A_USER', 1234)).resolves.toStrictEqual({
        offenderNo: 'A1234AA',
        offenderName: 'John Doe',
      })
    })
  })
})

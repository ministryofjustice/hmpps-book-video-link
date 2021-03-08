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

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')
jest.mock('./availabilityCheckService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const notificationService = new NotificationService(null, null) as jest.Mocked<NotificationService>
const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

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

const room = (i, description = `VCC ROOM ${i}`, userDescription = `Vcc Room ${i}`) =>
  ({
    description,
    locationId: i,
    userDescription,
  } as Location)

const bookingDetail: BookingDetails = {
  agencyId: 'WWI',
  offenderNo: 'A1234AA',
  comments: 'some comment',
  courtLocation: 'City of London',
  dateDescription: '20 November 2020',
  date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC),
  prisonBookingId: 789,
  prisonName: 'some prison',
  prisonerName: 'John Doe',
  videoBookingId: 1234,
  preDetails: {
    description: 'Vcc Room 3 - 17:40 to 18:00',
    endTime: '18:00',
    prisonRoom: 'Vcc Room 3',
    startTime: '17:40',
  },
  mainDetails: {
    description: 'Vcc Room 1 - 18:00 to 19:00',
    endTime: '19:00',
    prisonRoom: 'Vcc Room 1',
    startTime: '18:00',
  },
  postDetails: {
    description: 'Vcc Room 2 - 19:00 to 19:20',
    endTime: '19:20',
    prisonRoom: 'Vcc Room 2',
    startTime: '19:00',
  },
}

describe('Booking service', () => {
  const context = {}
  let service: BookingService

  beforeEach(() => {
    service = new BookingService(prisonApi, whereaboutsApi, notificationService, availabilityCheckService)
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
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should find booking details successfully when a booking exists', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      const result = await service.find(context, 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledTimes(1)
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'WWI')

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
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonerDetails.mockResolvedValue({
        bookingId: 1000,
        firstName: 'Jim',
        lastName: 'Bob',
      } as InmateDetail)
      whereaboutsApi.createVideoLinkBooking.mockResolvedValue(11)
    })

    describe('Creating a booking with all fields', () => {
      it('booking with all fields created', async () => {
        const videoBookingId = await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          court: 'City of London',
          comment: 'some comment',
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          pre: 1,
          main: 2,
          post: 3,
        })

        expect(videoBookingId).toBe(11)

        expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
          bookingId: 1000,
          court: 'City of London',
          comment: 'some comment',
          madeByTheCourt: true,
          pre: {
            startTime: '2020-11-20T17:40:00',
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
            endTime: '2020-11-20T19:20:00',
            locationId: 3,
          },
        })
      })

      it('email sent when all fields provided', async () => {
        const videoBookingId = await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          court: 'City of London',
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
          preDetails: 'Vcc Room 1 - 17:40 to 18:00',
          mainDetails: 'Vcc Room 2 - 18:00 to 19:00',
          postDetails: 'Vcc Room 3 - 19:00 to 19:20',
        })
      })
    })

    describe('Creating a booking with only mandatory fields', () => {
      it('booking with only mandatory fields created', async () => {
        await service.create(context, 'USER-1', {
          offenderNo: 'AA1234AA',
          agencyId: 'MDI',
          court: 'City of London',
          comment: undefined,
          mainStartTime: moment('2020-11-20T18:00:00'),
          mainEndTime: moment('2020-11-20T19:00:00'),
          main: 2,
          pre: undefined,
          post: undefined,
        })

        expect(whereaboutsApi.createVideoLinkBooking).toHaveBeenCalledWith(context, {
          bookingId: 1000,
          court: 'City of London',
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
        court: 'City of London',
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
      })
    })
  })

  describe('Get Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should get booking details successfully', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      const result = await service.get(context, 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'WWI')
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledTimes(1)
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, 'WWI')

      expect(result).toStrictEqual(bookingDetail)
    })
  })

  describe('Update', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should call whereaboutsApi correctly when updating a comment', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.updateComments(context, 'A_USER', 1234, 'another comment')

      expect(whereaboutsApi.updateVideoLinkBookingComment).toHaveBeenCalledWith(context, 1234, 'another comment')
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        ...bookingDetail,
        comments: 'another comment',
        preDescription: 'Vcc Room 3 - 17:40 to 18:00',
        mainDescription: 'Vcc Room 1 - 18:00 to 19:00',
        postDescription: 'Vcc Room 2 - 19:00 to 19:20',
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
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
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
        comment: 'A comment',
        pre: { locationId: 1, startTime: '2020-11-20T08:40:00', endTime: '2020-11-20T09:00:00' },
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
        post: { locationId: 3, startTime: '2020-11-20T10:00:00', endTime: '2020-11-20T10:20:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', {
        agencyId: 'WWI',
        courtLocation: 'City of London',
        dateDescription: '20 November 2020',
        offenderNo: 'A1234AA',
        comments: 'A comment',
        prisonName: 'some prison',
        prisonerName: 'John Doe',
        preDescription: 'Vcc Room 1 - 08:40 to 09:00',
        mainDescription: 'Vcc Room 2 - 09:00 to 10:00',
        postDescription: 'Vcc Room 3 - 10:00 to 10:20',
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
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
        preRequired: false,
        postRequired: false,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
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
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
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

    it('does not perform update when no long available availability', async () => {
      availabilityCheckService.getAvailabilityStatus.mockResolvedValue('NO_LONGER_AVAILABLE')
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        agencyId: 'WWI',
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        preRequired: false,
        postRequired: false,
        mainLocation: 2,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).not.toHaveBeenCalled()
    })
  })

  describe('Delete Booking', () => {
    const videoLinkBooking = {
      agencyId: 'WWI',
      bookingId: 789,
      comment: 'some comment',
      court: 'City of London',
      main: { startTime: '2020-11-20T18:00:00', endTime: '2020-11-20T19:00:00', locationId: 1 },
      post: { startTime: '2020-11-20T19:00:00', endTime: '2020-11-20T19:20:00', locationId: 2 },
      pre: { startTime: '2020-11-20T17:40:00', endTime: '2020-11-20T18:00:00', locationId: 3 },
      videoLinkBookingId: 1234,
    }

    it('Should call whereaboutsApi and PrisonApi correctly when deleting a booking', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.delete(context, 'A_USER', 1234)

      expect(whereaboutsApi.getVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(prisonApi.getPrisonBooking).toHaveBeenCalledWith(context, 789)
      expect(whereaboutsApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 1234)
      expect(notificationService.sendCancellationEmails).toHaveBeenCalledWith(context, 'A_USER', bookingDetail)
    })

    it('Should return the offender identifiers when deleting a booking', () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      return expect(service.delete(context, 'A_USER', 1234)).resolves.toStrictEqual({
        offenderNo: 'A1234AA',
        offenderName: 'John Doe',
      })
    })
  })
})

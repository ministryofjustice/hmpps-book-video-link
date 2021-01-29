import type { Location, InmateDetail } from 'prisonApi'
import moment from 'moment'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import NotificationService from './notificationService'
import { BookingDetails, NewBooking } from './model'
import BookingService from './bookingService'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'

jest.mock('../api/prisonApi')
jest.mock('../api/whereaboutsApi')
jest.mock('./notificationService')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const notificationService = new NotificationService(null, null) as jest.Mocked<NotificationService>

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
    timings: '17:40 to 18:00',
    description: 'Vcc Room 3 - 17:40 to 18:00',
    endTime: '18:00',
    prisonRoom: 'Vcc Room 3',
    startTime: '17:40',
  },
  mainDetails: {
    timings: '18:00 to 19:00',
    description: 'Vcc Room 1 - 18:00 to 19:00',
    endTime: '19:00',
    prisonRoom: 'Vcc Room 1',
    startTime: '18:00',
  },
  postDetails: {
    timings: '19:00 to 19:20',
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
    service = new BookingService(prisonApi, whereaboutsApi, notificationService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('Create', () => {
    it('Creating a booking with mandatory fields', async () => {
      await service.create(context, {
        bookingId: 1000,
        court: 'City of London',
        comment: 'some comment',
        main: {
          locationId: 2,
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
        },
        pre: {
          startTime: '2020-11-20T17:40:00',
          endTime: '2020-11-20T18:00:00',
          locationId: 1,
        },
        post: {
          startTime: '2020-11-20T19:00:00',
          endTime: '2020-11-20T19:20:00',
          locationId: 3,
        },
      })

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

    it('Extra fields are removed from locations', async () => {
      await service.create(context, {
        bookingId: 1000,
        court: 'City of London',
        comment: 'some comment',
        main: {
          locationId: 2,
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
        },
        pre: {
          startTime: '2020-11-20T17:40:00',
          endTime: '2020-11-20T18:00:00',
          locationId: 1,
          anExtraField: true,
        },
        post: {
          startTime: '2020-11-20T19:00:00',
          endTime: '2020-11-20T19:20:00',
          locationId: 3,
          anotherExtraField: 1234,
        },
      } as NewBooking)

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

    it('Creating a booking with only mandatory fields', async () => {
      await service.create(context, {
        bookingId: 1000,
        court: 'City of London',
        comment: undefined,
        main: {
          locationId: 2,
          startTime: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
        },
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
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', bookingDetail)
      expect(whereaboutsApi.updateVideoLinkBookingComment.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]
      )
    })
    it('Should call whereaboutsApi correctly when updating all appointments', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        preLocation: 1,
        mainLocation: 2,
        postLocation: 3,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        comment: 'A comment',
        pre: { locationId: 1, startTime: '2020-11-20T08:40:00', endTime: '2020-11-20T09:00:00' },
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
        post: { locationId: 3, startTime: '2020-11-20T10:00:00', endTime: '2020-11-20T10:20:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', bookingDetail)
      expect(whereaboutsApi.updateVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]
      )
    })

    it('Should call whereaboutsApi correctly when updating mandatory appointment', async () => {
      whereaboutsApi.getVideoLinkBooking.mockResolvedValue(videoLinkBooking)
      prisonApi.getAgencyDetails.mockResolvedValue(agencyDetail)
      prisonApi.getPrisonBooking.mockResolvedValue(offenderDetails)
      prisonApi.getLocationsForAppointments.mockResolvedValue([room(1), room(2), room(3)])

      await service.update(context, 'A_USER', 1234, {
        comment: 'A comment',
        date: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        startTime: moment('2020-11-20T09:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T10:00:00', DATE_TIME_FORMAT_SPEC, true),
        mainLocation: 2,
      })

      expect(whereaboutsApi.updateVideoLinkBooking).toHaveBeenCalledWith(context, 1234, {
        comment: 'A comment',
        main: { locationId: 2, startTime: '2020-11-20T09:00:00', endTime: '2020-11-20T10:00:00' },
      })
      expect(notificationService.sendBookingUpdateEmails).toHaveBeenCalledWith(context, 'A_USER', bookingDetail)
      expect(whereaboutsApi.updateVideoLinkBooking.mock.invocationCallOrder[0]).toBeLessThan(
        whereaboutsApi.getVideoLinkBooking.mock.invocationCallOrder[0]
      )
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

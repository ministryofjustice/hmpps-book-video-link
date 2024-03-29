import moment, { Moment } from 'moment'
import type { Appointment, NewAppointment } from 'whereaboutsApi'

import type WhereaboutsApi from '../api/whereaboutsApi'
import type PrisonApi from '../api/prisonApi'
import type NotificationService from './notificationService'
import type LocationService from './locationService'
import type AvailabilityCheckService from './availabilityCheckService'

import type {
  AvailabilityStatus,
  BookingDetails,
  BookingUpdate,
  Context,
  NewBooking,
  OffenderIdentifiers,
} from './model'

import { DATE_ONLY_LONG_FORMAT_SPEC, DATE_TIME_FORMAT_SPEC, Time } from '../shared/dateHelpers'
import { formatName } from '../utils'
import { postAppointmentTimes, preAppointmentTimes } from './bookingTimes'
import log from '../log'

type AppointmentDetail = {
  locationId: number
  description: string
  start: Moment
  end: Moment
}

export = class BookingService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly notificationService: NotificationService,
    private readonly availabilityCheckService: AvailabilityCheckService,
    private readonly locationService: LocationService
  ) {}

  public async find(context: Context, videoBookingId: number): Promise<BookingDetails | undefined> {
    try {
      return await this.get(context, videoBookingId)
    } catch (error) {
      if (error.status === 404) {
        return undefined
      }
      throw error
    }
  }

  private static toNewAppointment(appointment: AppointmentDetail): NewAppointment {
    return {
      locationId: appointment.locationId,
      startTime: appointment.start.format(DATE_TIME_FORMAT_SPEC),
      endTime: appointment.end.format(DATE_TIME_FORMAT_SPEC),
    }
  }

  public async create(context: Context, currentUsername: string, newBooking: NewBooking): Promise<number | false> {
    const { agencyId, mainStartTime, mainEndTime, pre, main, post } = newBooking

    const status = await this.availabilityCheckService.getAvailabilityStatus(context, {
      agencyId,
      date: mainStartTime,
      startTime: mainStartTime,
      endTime: mainEndTime,
      preLocation: pre,
      mainLocation: main,
      postLocation: post,
    })

    if (status === 'AVAILABLE') {
      return this.createBooking(context, currentUsername, newBooking)
    }
    return false
  }

  private async createBooking(
    context: Context,
    currentUsername: string,
    { offenderNo, agencyId, courtId, comment, mainStartTime, mainEndTime, main, pre, post }: NewBooking
  ): Promise<number> {
    const [prisonBooking, agencyDetails, roomFinder] = await Promise.all([
      this.prisonApi.getPrisonerDetails(context, offenderNo),
      this.prisonApi.getAgencyDetails(context, agencyId),
      this.locationService.createRoomFinder(context, agencyId),
    ])

    const toAppointmentDetails = (locationId: number, [start, end]: [Moment, Moment]) => ({
      locationId,
      start,
      end,
      description: roomFinder.bookingDescription(locationId, [start, end]),
    })

    const preAppointment = pre ? toAppointmentDetails(pre, preAppointmentTimes(mainStartTime)) : null
    const mainAppointment = toAppointmentDetails(main, [mainStartTime, mainEndTime])
    const postAppointment = post ? toAppointmentDetails(post, postAppointmentTimes(mainEndTime)) : null

    const videoBookingId = await this.whereaboutsApi.createVideoLinkBooking(context, {
      bookingId: prisonBooking.bookingId,
      courtId,
      madeByTheCourt: true,
      ...(comment ? { comment } : {}),
      main: BookingService.toNewAppointment(mainAppointment),
      ...(preAppointment ? { pre: BookingService.toNewAppointment(preAppointment) } : {}),
      ...(postAppointment ? { post: BookingService.toNewAppointment(postAppointment) } : {}),
    })

    const court = await this.locationService.getVideoLinkEnabledCourt(context, courtId)
    const courtEmailAddress = await this.whereaboutsApi.getCourtEmail(context, courtId)

    try {
      await this.notificationService.sendBookingCreationEmails(context, currentUsername, {
        agencyId,
        court: court.name,
        prison: agencyDetails.description,
        offenderNo,
        prisonerName: formatName(prisonBooking.firstName, prisonBooking.lastName),
        date: mainStartTime,
        preDetails: preAppointment?.description,
        mainDetails: mainAppointment.description,
        postDetails: postAppointment?.description,
        comment,
        courtEmailAddress: courtEmailAddress?.email,
      })
    } catch (e) {
      log.error('Notify failed: ', e)
    }

    return videoBookingId
  }

  public async get(context: Context, videoBookingId: number): Promise<BookingDetails> {
    const bookingDetails = await this.whereaboutsApi.getVideoLinkBooking(context, videoBookingId)
    const [prisonBooking, agencyDetails, roomFinder] = await Promise.all([
      this.prisonApi.getPrisonBooking(context, bookingDetails.bookingId),
      this.prisonApi.getAgencyDetails(context, bookingDetails.agencyId),
      this.locationService.createRoomFinder(context, bookingDetails.agencyId),
    ])

    const toAppointmentDetails = (appointment: Appointment) => {
      const startTime = moment(appointment.startTime, DATE_TIME_FORMAT_SPEC)
      const endTime = moment(appointment.endTime, DATE_TIME_FORMAT_SPEC)
      return {
        prisonRoom: roomFinder.prisonRoom(appointment.locationId),
        description: roomFinder.bookingDescription(appointment.locationId, [startTime, endTime]),
        startTime: Time(appointment.startTime),
        endTime: Time(appointment.endTime),
        locationId: appointment.locationId,
      }
    }

    return {
      videoBookingId,
      prisonerName: formatName(prisonBooking.firstName, prisonBooking.lastName),
      offenderNo: prisonBooking.offenderNo,
      prisonBookingId: prisonBooking.bookingId,
      prisonName: agencyDetails.description,
      agencyId: agencyDetails.agencyId,
      courtLocation: bookingDetails.court,
      courtId: bookingDetails.courtId,
      dateDescription: moment(bookingDetails.main.startTime, DATE_TIME_FORMAT_SPEC).format(DATE_ONLY_LONG_FORMAT_SPEC),
      date: moment(bookingDetails.main.startTime, DATE_TIME_FORMAT_SPEC),
      comments: bookingDetails.comment,
      ...(bookingDetails.pre ? { preDetails: toAppointmentDetails(bookingDetails.pre) } : {}),
      mainDetails: toAppointmentDetails(bookingDetails.main),
      ...(bookingDetails.post ? { postDetails: toAppointmentDetails(bookingDetails.post) } : {}),
    }
  }

  private toAppointment = (locationId: number, [start, end]: [Moment, Moment]): Appointment => ({
    locationId,
    startTime: start.format(DATE_TIME_FORMAT_SPEC),
    endTime: end.format(DATE_TIME_FORMAT_SPEC),
  })

  private async updateBooking(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    update: BookingUpdate
  ) {
    const existing = await this.get(context, videoBookingId)

    await this.whereaboutsApi.updateVideoLinkBooking(context, videoBookingId, {
      courtId: update.courtId,
      comment: update.comment,
      pre: update.preLocation && this.toAppointment(update.preLocation, preAppointmentTimes(update.startTime)),
      main: this.toAppointment(update.mainLocation, [update.startTime, update.endTime]),
      post: update.postLocation && this.toAppointment(update.postLocation, postAppointmentTimes(update.endTime)),
    })

    const court = await this.locationService.getVideoLinkEnabledCourt(context, update.courtId)
    const { bookingDescription: description } = await this.locationService.createRoomFinder(context, existing.agencyId)
    const courtEmailAddress = await this.whereaboutsApi.getCourtEmail(context, court.id)

    try {
      await this.notificationService.sendBookingUpdateEmails(context, currentUsername, {
        offenderNo: existing.offenderNo,
        agencyId: existing.agencyId,
        prisonName: existing.prisonName,
        prisonerName: existing.prisonerName,
        courtLocation: court.name,
        comments: update.comment,
        dateDescription: update.startTime.format(DATE_ONLY_LONG_FORMAT_SPEC),
        preDescription: update.preLocation && description(update.preLocation, preAppointmentTimes(update.startTime)),
        mainDescription: description(update.mainLocation, [update.startTime, update.endTime]),
        postDescription: update.postLocation && description(update.postLocation, postAppointmentTimes(update.endTime)),
        courtEmailAddress: courtEmailAddress?.email,
      })
    } catch (e) {
      log.error('Notify failed: ', e)
    }
  }

  public async update(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    update: BookingUpdate
  ): Promise<AvailabilityStatus> {
    const status = await this.availabilityCheckService.getAvailabilityStatus(context, { videoBookingId, ...update })

    if (status === 'AVAILABLE') {
      await this.updateBooking(context, currentUsername, videoBookingId, update)
    }
    return status
  }

  public async updateComments(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    comment: string
  ): Promise<void> {
    const existing = await this.get(context, videoBookingId)
    await this.whereaboutsApi.updateVideoLinkBookingComment(context, videoBookingId, comment)
    try {
      await this.notificationService.sendBookingUpdateEmails(context, currentUsername, {
        ...existing,
        comments: comment,
        preDescription: existing.preDetails?.description,
        mainDescription: existing.mainDetails.description,
        postDescription: existing.postDetails?.description,
      })
    } catch (e) {
      log.error('Notify failed: ', e)
    }
  }

  public async delete(context: Context, currentUsername: string, videoBookingId: number): Promise<OffenderIdentifiers> {
    const details = await this.get(context, videoBookingId)
    await this.whereaboutsApi.deleteVideoLinkBooking(context, videoBookingId)
    const courtEmailAddress = await this.whereaboutsApi.getCourtEmail(context, details.courtId)
    details.courtEmailAddress = courtEmailAddress?.email

    try {
      await this.notificationService.sendCancellationEmails(context, currentUsername, details)
    } catch (e) {
      log.error('Notify failed: ', e)
    }
    return {
      offenderNo: details.offenderNo,
      offenderName: details.prisonerName,
    }
  }
}

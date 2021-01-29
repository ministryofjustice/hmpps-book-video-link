import moment, { Moment } from 'moment'
import type { Appointment, NewAppointment } from 'whereaboutsApi'
import type WhereaboutsApi from '../api/whereaboutsApi'
import type PrisonApi from '../api/prisonApi'
import type { BookingDetails, OffenderIdentifiers, Context, NewBooking, BookingUpdate } from './model'
import type NotificationService from './notificationService'

import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_LONG_FORMAT_SPEC, Time } from '../shared/dateHelpers'
import { formatName } from '../utils'
import { postAppointmentTime, preAppointmentTimes } from './bookingTimes'

export = class BookingService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly notificationService: NotificationService
  ) {}

  /** filter object keys to only include fields relevant to type. */
  private pick(appointment: NewAppointment): NewAppointment {
    return { locationId: appointment.locationId, startTime: appointment.startTime, endTime: appointment.endTime }
  }

  public async create(context: Context, { bookingId, court, comment, main, pre, post }: NewBooking): Promise<void> {
    await this.whereaboutsApi.createVideoLinkBooking(context, {
      bookingId,
      court,
      madeByTheCourt: true,
      ...(comment ? { comment } : {}),
      main,
      ...(pre ? { pre: this.pick(pre) } : {}),
      ...(post ? { post: this.pick(post) } : {}),
    })
  }

  public async get(context: Context, videoBookingId: number): Promise<BookingDetails> {
    const bookingDetails = await this.whereaboutsApi.getVideoLinkBooking(context, videoBookingId)

    const [prisonBooking, agencyDetails, locations] = await Promise.all([
      this.prisonApi.getPrisonBooking(context, bookingDetails.bookingId),
      this.prisonApi.getAgencyDetails(context, bookingDetails.agencyId),
      this.prisonApi.getLocationsForAppointments(context, bookingDetails.agencyId),
    ])

    const toAppointmentDetails = (appointment: Appointment) => {
      const location = locations.find(loc => loc.locationId === appointment.locationId)
      const prisonRoom = location?.userDescription || location?.description || ''
      const description = `${prisonRoom} - ${Time(appointment.startTime)} to ${Time(appointment.endTime)}`
      const timings = `${Time(appointment.startTime)} to ${Time(appointment.endTime)}`
      return {
        prisonRoom,
        description,
        timings,
        startTime: Time(appointment.startTime),
        endTime: Time(appointment.endTime),
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

  public async update(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    update: BookingUpdate
  ): Promise<void> {
    await this.whereaboutsApi.updateVideoLinkBooking(context, videoBookingId, {
      comment: update.comment,
      ...(update.preLocation
        ? { pre: this.toAppointment(update.preLocation, preAppointmentTimes(update.startTime)) }
        : {}),
      main: this.toAppointment(update.mainLocation, [update.startTime, update.endTime]),
      ...(update.postLocation
        ? { post: this.toAppointment(update.postLocation, postAppointmentTime(update.endTime)) }
        : {}),
    })
    const details = await this.get(context, videoBookingId)
    await this.notificationService.sendBookingUpdateEmails(context, currentUsername, details)
  }

  public async updateComments(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    comment: string
  ): Promise<void> {
    await this.whereaboutsApi.updateVideoLinkBookingComment(context, videoBookingId, comment)
    const details = await this.get(context, videoBookingId)
    await this.notificationService.sendBookingUpdateEmails(context, currentUsername, details)
  }

  public async delete(context: Context, currentUsername: string, videoBookingId: number): Promise<OffenderIdentifiers> {
    const details = await this.get(context, videoBookingId)
    await this.whereaboutsApi.deleteVideoLinkBooking(context, videoBookingId)
    await this.notificationService.sendCancellationEmails(context, currentUsername, details)
    return {
      offenderNo: details.offenderNo,
      offenderName: details.prisonerName,
    }
  }
}

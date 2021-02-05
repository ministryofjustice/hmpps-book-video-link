import moment, { Moment } from 'moment'
import type { Appointment, NewAppointment } from 'whereaboutsApi'
import { Location } from 'prisonApi'

import type WhereaboutsApi from '../api/whereaboutsApi'
import type PrisonApi from '../api/prisonApi'
import type {
  BookingDetails,
  OffenderIdentifiers,
  Context,
  NewBooking,
  BookingUpdate,
  AvailabilityStatus,
} from './model'
import type NotificationService from './notificationService'

import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_LONG_FORMAT_SPEC, Time, MOMENT_TIME } from '../shared/dateHelpers'
import { formatName } from '../utils'
import { postAppointmentTime, preAppointmentTimes } from './bookingTimes'
import AvailabilityCheckService from './availabilityCheckService'

type AppointmentDto = Appointment & { description: string }

export = class BookingService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly notificationService: NotificationService,
    private readonly availabilityCheckService: AvailabilityCheckService
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

  private toAppointmentDto = (
    locations: Location[],
    locationId: number,
    [start, end]: [Moment, Moment]
  ): AppointmentDto => {
    const location = locations.find(loc => loc.locationId === locationId)
    const prisonRoom = location?.userDescription || location?.description || ''
    const description = `${prisonRoom} - ${start.format(MOMENT_TIME)} to ${end.format(MOMENT_TIME)}`
    return {
      locationId,
      startTime: start.format(DATE_TIME_FORMAT_SPEC),
      endTime: end.format(DATE_TIME_FORMAT_SPEC),
      description,
    }
  }

  private toAppointment = ({ description, ...rest }: AppointmentDto): Appointment => rest

  public async update(
    context: Context,
    currentUsername: string,
    videoBookingId: number,
    update: BookingUpdate
  ): Promise<AvailabilityStatus> {
    const status = await this.availabilityCheckService.getAvailabilityStatus(
      context,
      { videoBookingId, ...update },
      { pre: update.preLocation, main: update.mainLocation, post: update.postLocation }
    )

    if (status === 'AVAILABLE') {
      const existing = await this.get(context, videoBookingId)
      const locations = await this.prisonApi.getLocationsForAppointments(context, existing.agencyId)

      const pre =
        update.preRequired &&
        this.toAppointmentDto(locations, update.preLocation, preAppointmentTimes(update.startTime))

      const main = this.toAppointmentDto(locations, update.mainLocation, [update.startTime, update.endTime])

      const post =
        update.postRequired &&
        this.toAppointmentDto(locations, update.postLocation, postAppointmentTime(update.endTime))

      await this.whereaboutsApi.updateVideoLinkBooking(context, videoBookingId, {
        comment: update.comment,
        ...(pre ? { pre: this.toAppointment(pre) } : {}),
        main: this.toAppointment(main),
        ...(post ? { post: this.toAppointment(post) } : {}),
      })

      await this.notificationService.sendBookingUpdateEmails(context, currentUsername, {
        offenderNo: existing.offenderNo,
        agencyId: existing.agencyId,
        prisonName: existing.prisonName,
        prisonerName: existing.prisonerName,
        courtLocation: existing.courtLocation,
        comments: update.comment,
        dateDescription: update.startTime.format(DATE_ONLY_LONG_FORMAT_SPEC),
        preDetailsDescription: pre?.description,
        mainDetailsDescription: main.description,
        postDetailsDescription: post?.description,
      })
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
    await this.notificationService.sendBookingUpdateEmails(context, currentUsername, {
      ...existing,
      comments: comment,
      preDetailsDescription: existing.preDetails?.description,
      mainDetailsDescription: existing.mainDetails.description,
      postDetailsDescription: existing.postDetails?.description,
    })
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

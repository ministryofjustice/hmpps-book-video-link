import moment from 'moment'
import { Appointment, NewVideoLinkBooking } from 'whereaboutsApi'
import { DATE_TIME_FORMAT_SPEC, Time } from '../shared/dateHelpers'
import { formatName } from '../utils'
import type WhereaboutsApi from '../api/whereaboutsApi'
import type PrisonApi from '../api/prisonApi'
import { BookingDetails, OffenderIdentifiers, Context } from './model'
import NotificationService from './notificationService'

export = class AppointmentService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly notificationService: NotificationService
  ) {}

  public async createAppointmentRequest(
    appointmentDetails,
    comment: string,
    prepostAppointments,
    mainLocationId: string,
    context: Context
  ): Promise<void> {
    const appointment: NewVideoLinkBooking = {
      bookingId: appointmentDetails.bookingId,
      court: appointmentDetails.court,
      madeByTheCourt: true,
      main: {
        locationId: parseInt(mainLocationId, 10),
        startTime: appointmentDetails.startTime,
        endTime: appointmentDetails.endTime,
      },
    }

    if (comment) {
      appointment.comment = comment
    }

    if (prepostAppointments.preAppointment) {
      appointment.pre = prepostAppointments.preAppointment
    }

    if (prepostAppointments.postAppointment) {
      appointment.post = prepostAppointments.postAppointment
    }

    await this.whereaboutsApi.createVideoLinkBooking(context, appointment)
  }

  public async getBookingDetails(context: Context, videoBookingId: number): Promise<BookingDetails> {
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
      return { prisonRoom, description, startTime: Time(appointment.startTime), endTime: Time(appointment.endTime) }
    }

    return {
      videoBookingId,
      prisonerName: formatName(prisonBooking.firstName, prisonBooking.lastName),
      offenderNo: prisonBooking.offenderNo,
      prisonBookingId: prisonBooking.bookingId,
      prisonName: agencyDetails.description,
      agencyId: agencyDetails.agencyId,
      courtLocation: bookingDetails.court,
      date: moment(bookingDetails.main.startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
      comments: bookingDetails.comment,
      ...(bookingDetails.pre ? { preDetails: toAppointmentDetails(bookingDetails.pre) } : {}),
      mainDetails: toAppointmentDetails(bookingDetails.main),
      ...(bookingDetails.post ? { postDetails: toAppointmentDetails(bookingDetails.post) } : {}),
    }
  }

  public async deleteBooking(
    context: Context,
    currentUsername: string,
    videoBookingId: number
  ): Promise<OffenderIdentifiers> {
    const details = await this.getBookingDetails(context, videoBookingId)
    await this.whereaboutsApi.deleteVideoLinkBooking(context, videoBookingId)
    await this.notificationService.sendCancellationEmails(context, currentUsername, details)
    return {
      offenderNo: details.offenderNo,
      offenderName: details.prisonerName,
    }
  }
}

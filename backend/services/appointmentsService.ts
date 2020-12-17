import moment from 'moment'
import { NewVideoLinkBooking } from 'whereaboutsApi'
import { DATE_TIME_FORMAT_SPEC, Time } from '../shared/dateHelpers'
import { formatName } from '../utils'
import type WhereaboutsApi from '../api/whereaboutsApi'
import type PrisonApi from '../api/prisonApi'

type Context = any

type Option = {
  value: string
  text: string
}

type AppointmentOptions = {
  locationTypes: Option[]
  appointmentTypes: Option[]
}

type OffenderIdentifiers = {
  offenderNo: string
  bookingId: number
  offenderName: string
}

type BookingDetails = {
  videoBookingId: number
  details: {
    name: string
    prison: string
    prisonRoom: string
  }
  hearingDetails: {
    date: string
    courtHearingStartTime: string
    courtHearingEndTime: string
    comments: string | undefined
  }
  prePostDetails: {
    'pre-court hearing briefing': string | undefined
    'post-court hearing briefing': string | undefined
  }
  courtDetails: {
    courtLocation: string
  }
}

export = class AppointmentService {
  constructor(private readonly prisonApi: PrisonApi, private readonly whereaboutsApi: WhereaboutsApi) {}

  private mapLocationType(location): Option {
    return { value: location.locationId, text: location.userDescription || location.description }
  }

  private mapAppointmentType(appointment): Option {
    return { value: appointment.code, text: appointment.description }
  }

  public async getVideoLinkLocations(context: Context, agency: string): Promise<Option[]> {
    return (await this.prisonApi.getLocationsForAppointments(context, agency))
      .filter(loc => loc.locationType === 'VIDE')
      .map(this.mapLocationType)
  }

  public async getAppointmentOptions(context: Context, agency: string): Promise<AppointmentOptions> {
    const [locationTypes, appointmentTypes] = await Promise.all([
      this.prisonApi.getLocationsForAppointments(context, agency),
      this.prisonApi.getAppointmentTypes(context),
    ])
    return {
      locationTypes: locationTypes && locationTypes.map(this.mapLocationType),
      appointmentTypes: appointmentTypes && appointmentTypes.map(this.mapAppointmentType),
    }
  }

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

    const [offenderIdentifiers, prisonName, vccRoom] = await Promise.all([
      this.getOffenderIdentifiers(context, bookingDetails.bookingId),
      this.prisonApi.getAgencyDetails(context, bookingDetails.agencyId),
      this.prisonApi.getLocation(context, bookingDetails.main.locationId),
    ])

    return {
      videoBookingId,
      details: {
        name: offenderIdentifiers.offenderName,
        prison: prisonName.description,
        prisonRoom: vccRoom.description,
      },
      hearingDetails: {
        date: moment(bookingDetails.main.startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
        courtHearingStartTime: Time(bookingDetails.main.startTime),
        courtHearingEndTime: Time(bookingDetails.main.endTime),
        comments: bookingDetails.comment,
      },
      prePostDetails: {
        'pre-court hearing briefing': bookingDetails.pre
          ? `${Time(bookingDetails.pre.startTime)} to ${Time(bookingDetails.pre.endTime)}`
          : null,
        'post-court hearing briefing': bookingDetails.post
          ? `${Time(bookingDetails.post.startTime)} to ${Time(bookingDetails.post.endTime)}`
          : null,
      },
      courtDetails: {
        courtLocation: bookingDetails.court,
      },
    }
  }

  public async deleteBooking(context: Context, videoBookingId: number): Promise<OffenderIdentifiers> {
    const { bookingId } = await this.whereaboutsApi.getVideoLinkBooking(context, videoBookingId)

    const offenderIdentifiers = await this.getOffenderIdentifiers(context, bookingId)
    await this.whereaboutsApi.deleteVideoLinkBooking(context, videoBookingId)
    return offenderIdentifiers
  }

  private async getOffenderIdentifiers(context: Context, bookingId: number): Promise<OffenderIdentifiers> {
    const offenderDetails = await this.prisonApi.getPrisonBooking(context, bookingId)

    const offenderIdentifiers = {
      offenderNo: offenderDetails.offenderNo,
      bookingId: offenderDetails.bookingId,
      offenderName: formatName(offenderDetails.firstName, offenderDetails.lastName),
    }

    return offenderIdentifiers
  }
}

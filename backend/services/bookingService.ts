import type prisonApiTypes from 'prisonApi'
import moment from 'moment'
import type { Appointment, VideoLinkBooking } from 'whereaboutsApi'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { formatName, getTime } from '../utils'

// FIXME: Temporary fix before scaling work
const agencyId = 'WWI'

type AppointmentDto = {
  videoLinkBookingId: number
  offenderName: string
  prisonLocation: string
  court: string
  time: string
  hearingType: HearingType
}

type HearingType = 'PRE' | 'MAIN' | 'POST'

type AppointmentResult = {
  courts: string[]
  appointments: AppointmentDto[]
}

type OffenderBooking = prisonApiTypes.schemas['OffenderBooking']
type Location = prisonApiTypes.schemas['Location']

export = class BookingService {
  constructor(private readonly prisonApi: PrisonApi, private readonly whereaboutsApi: WhereaboutsApi) {}

  private filterByCourt(option: string, courts: string[], booking: VideoLinkBooking) {
    if (!option) {
      return true
    }
    if (option === 'Other') {
      return !courts.includes(booking.court)
    }
    return option === booking.court
  }

  private getOffenderName(offenderBookings: OffenderBooking[], booking: VideoLinkBooking) {
    const offenderBooking = offenderBookings.find(b => b.bookingId === booking.bookingId)
    return offenderBooking ? formatName(offenderBooking.firstName, offenderBooking.lastName) : ''
  }

  private async toAppointment(context: any, locations: Location[], bookings: VideoLinkBooking[]) {
    const offenderBookings = await this.prisonApi.getPrisonBookings(context, [
      ...new Set(bookings.map(b => b.bookingId)),
    ])

    return (booking: VideoLinkBooking, slot: Appointment, hearingType: HearingType) => {
      return {
        locationId: slot.locationId,
        court: booking.court,
        offenderName: this.getOffenderName(offenderBookings, booking),
        prisonLocation: locations.find(loc => loc.locationId === slot.locationId)?.userDescription || '',
        videoLinkBookingId: booking.videoLinkBookingId,
        hearingType,
        time: slot.endTime ? `${getTime(slot.startTime)} to ${getTime(slot.endTime)}` : getTime(booking.pre.startTime),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }
    }
  }

  public async getAppointmentList(
    context: any,
    searchDate: moment.Moment,
    courtFilter: string
  ): Promise<AppointmentResult> {
    const [courts, bookings, locations] = await Promise.all([
      this.whereaboutsApi.getCourtLocations(context).then(r => r.courtLocations),
      this.whereaboutsApi.getVideoLinkBookings(context, searchDate.format('YYYY-MM-DD')),
      this.prisonApi.getLocationsForAppointments(context, agencyId),
    ])

    const relevantBookings = bookings
      .filter(booking => booking.agencyId === agencyId)
      .filter(booking => this.filterByCourt(courtFilter, courts, booking))

    const toAppointment = await this.toAppointment(context, locations, relevantBookings)

    const appointments = relevantBookings
      .flatMap(booking => [
        ...(booking.pre ? [toAppointment(booking, booking.pre, 'PRE')] : []),
        toAppointment(booking, booking.main, 'MAIN'),
        ...(booking.post ? [toAppointment(booking, booking.post, 'POST')] : []),
      ])
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return { courts, appointments }
  }
}

import type { Prison } from 'prisonApi'
import type { Prisoner } from 'prisonerOffenderSearchApi'
import moment from 'moment'
import type { Appointment, Location, VideoLinkBooking } from 'whereaboutsApi'

import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { formatName, getTime, flattenCalls, toMap } from '../utils'
import { app } from '../config'
import { Context, HearingType, Bookings, Court } from './model'
import PrisonerOffenderSearchApi from '../api/prisonerOffenderSearchApi'
import LocationService from './locationService'

export = class ViewBookingsService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly prisonerOffenderSearch: PrisonerOffenderSearchApi,
    private readonly locationService: LocationService
  ) {}

  private getOffenderName(offenderBookings: Prisoner[], booking: VideoLinkBooking) {
    const offenderBooking = offenderBookings.find(b => Number(b.bookingId) === booking.bookingId)
    return offenderBooking ? formatName(offenderBooking.firstName, offenderBooking.lastName) : ''
  }

  private async appointmentBuilder(
    context: Context,
    prisons: Map<string, Prison>,
    locations: Map<number, Location>,
    bookings: VideoLinkBooking[]
  ) {
    const prisoners = !bookings.length
      ? []
      : await this.prisonerOffenderSearch.getPrisoners(context, [...new Set(bookings.map(b => b.bookingId))])

    return (booking: VideoLinkBooking, slot: Appointment, hearingType: HearingType) => {
      const location = locations.get(slot.locationId)
      const prison = prisons.get(booking.agencyId)
      return {
        locationId: slot.locationId,
        court: booking.court,
        offenderName: this.getOffenderName(prisoners, booking),
        prison: prison?.formattedDescription || '',
        prisonLocation: location?.description || '',
        videoLinkBookingId: booking.videoLinkBookingId,
        hearingType,
        time: slot.endTime ? `${getTime(slot.startTime)} to ${getTime(slot.endTime)}` : getTime(booking.pre.startTime),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }
    }
  }

  private sortAlphabetically(courts: Court[]): Court[] {
    return courts.sort((a, b) => a.text.localeCompare(b.text))
  }

  public async getList(
    context: Context,
    searchDate: moment.Moment,
    courtIdFilter: string,
    username: string
  ): Promise<Bookings> {
    const [courts, prisons] = await Promise.all([
      this.locationService.getVideoLinkEnabledCourts(context, username),
      this.prisonApi.getAgencies(context).then(result => toMap(result, 'agencyId')),
    ])

    const sortedCourts = this.sortAlphabetically(courts)
    const courtId = courtIdFilter || sortedCourts[0].value

    const bookingRequests = app.videoLinkEnabledFor.map(prison =>
      this.whereaboutsApi.getVideoLinkBookings(context, prison, searchDate, courtId)
    )
    const locationRequests = app.videoLinkEnabledFor.map(prison => this.whereaboutsApi.getRooms(context, prison))

    const [locations, bookings] = await Promise.all([
      flattenCalls(locationRequests).then(result => toMap(result, 'locationId')),
      flattenCalls(bookingRequests),
    ])

    const relevantBookings = bookings.flatMap(array => array)

    const toAppointment = await this.appointmentBuilder(context, prisons, locations, relevantBookings)

    const appointments = relevantBookings
      .flatMap(booking => [
        ...(booking.pre ? [toAppointment(booking, booking.pre, 'PRE')] : []),
        toAppointment(booking, booking.main, 'MAIN'),
        ...(booking.post ? [toAppointment(booking, booking.post, 'POST')] : []),
      ])
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return { courts: sortedCourts, appointments }
  }
}

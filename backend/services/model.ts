import { NewAppointment, Interval } from 'whereaboutsApi'
import { Moment } from 'moment'

export type Context = unknown

export type Room = {
  value: number
  text: string
}
export type AvailabilityRequest = {
  agencyId: string
  videoBookingId?: number
  date: Moment
  startTime: Moment
  endTime: Moment
  preRequired: boolean
  postRequired: boolean
}

export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'NO_LONGER_AVAILABLE'

export type LegacyRoomAvailability = { mainLocations: Room[]; preLocations: Room[]; postLocations: Room[] }

export type SelectedRooms = { pre?: number; main: number; post?: number }

export type Rooms = { main: Room[]; pre: Room[]; post: Room[] }

export type RoomAvailability = {
  isAvailable: boolean
  rooms: Rooms
  totalInterval: Interval
}

export type AppointmentDetail = {
  startTime: string
  endTime: string
  prisonRoom: string
  description: string
  timings: string
}

export type BookingDetails = {
  videoBookingId: number
  prisonerName: string
  offenderNo: string
  prisonName: string
  prisonBookingId: number
  agencyId: string
  courtLocation: string
  date: Moment
  dateDescription: string
  comments: string
  preDetails?: AppointmentDetail
  mainDetails: AppointmentDetail
  postDetails?: AppointmentDetail
}

export type OffenderIdentifiers = {
  offenderNo: string
  offenderName: string
}

type Row = {
  videoLinkBookingId: number
  offenderName: string
  prison: string
  prisonLocation: string
  court: string
  time: string
  hearingType: HearingType
}

export type HearingType = 'PRE' | 'MAIN' | 'POST'

export type Bookings = {
  courts: string[]
  // Each booking is split into up to 3 separate appointments, this is the flattened list.
  appointments: Row[]
}

export type NewBooking = {
  bookingId: number
  court: string
  comment: string | undefined
  main: NewAppointment
  pre: NewAppointment | undefined
  post: NewAppointment | undefined
}

export type BookingUpdate = {
  date: Moment
  comment: string
  startTime: Moment
  endTime: Moment
  preLocation?: number
  mainLocation: number
  postLocation?: number
}

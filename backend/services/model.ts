export type Context = unknown

export type AppointmentDetail = {
  startTime: string
  endTime: string
  prisonRoom: string
  description: string
}

export type BookingDetails = {
  videoBookingId: number
  prisonerName: string
  offenderNo: string
  prisonName: string
  prisonBookingId: number
  agencyId: string
  courtLocation: string
  date: string
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

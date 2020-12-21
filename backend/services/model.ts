export type Context = any

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

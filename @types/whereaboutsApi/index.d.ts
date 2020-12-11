declare module 'whereaboutsApi' {
  export type CourtLocations = { courtLocations: string[] }

  export type NewAppointment = { endTime: string; locationId: number; startTime: string }

  export type NewVideoLinkBooking = {
    bookingId: number
    comment: string
    court: string
    madeByTheCourt: boolean
    main: NewAppointment
    post: NewAppointment
    pre: NewAppointment
  }

  export type VideoLinkAppointmentIds = number[]

  export type HearingType = 'MAIN' | 'PRE' | 'POST'

  export type VideoLinkAppointment = {
    appointmentId: number
    bookingId: number
    court: string
    createdByUsername: string
    hearingType: HearingType
    id: number
    madeByTheCourt: boolean
  }

  export type VideoLinkAppointments = {
    appointments: VideoLinkAppointment[]
  }

  export type VideoLinkBooking = {
    agencyId: string
    bookingId: number
    comment: string
    court: string
    main: Appointment
    post: Appointment
    pre: Appointment
    videoLinkBookingId: number
  }

  export type Appointment = {
    startTime: string
    endTime: string
    locationId: number
  }
}

declare module 'whereaboutsApi' {
  export type CourtLocations = { courtLocations: string[] }

  export type NewAppointment = { endTime: string; locationId: number; startTime: string }

  export type NewVideoLinkBooking = {
    bookingId: number
    comment?: string
    court: string
    madeByTheCourt: boolean
    main: NewAppointment
    post?: NewAppointment
    pre?: NewAppointment
  }

  export type HearingType = 'MAIN' | 'PRE' | 'POST'

  export type VideoLinkBooking = {
    agencyId: string
    bookingId: number
    comment?: string
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

  export type Interval = { start: string; end: string }

  export type AppointmentLocationsSpecification = {
    agencyId: string
    appointmentIntervals: Interval[]
    date: string
    vlbIdsToExclude: number[]
  }

  export type Location = {
    locationId: number
    userDescription?: string
    description: string
  }

  export type AvailableLocation = {
    appointmentInterval: Interval
    locations: Location[]
  }
}

declare module 'whereaboutsApi' {
  export type CourtLocations = { courtLocations: string[] }

  export type Court = {
    id: string
    name: string
  }

  export type NewAppointment = { endTime: string; locationId: number; startTime: string }

  export type NewVideoLinkBooking = {
    bookingId: number
    comment?: string
    courtId: string
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
    courtId: string
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
    date: string
    vlbIdsToExclude: number[]
    preInterval?: Interval
    mainInterval: Interval
    postInterval?: Interval
  }

  export type Location = {
    locationId: number
    description: string
  }

  export type AvailableLocations = {
    pre: Location[]
    main: Location[]
    post: Location[]
  }

  export type UpdateVideoLinkBooking = {
    comment: string
    pre?: Appointment
    main: Appointment
    post?: Appointment
  }

  // Request object
  export type VideoLinkBookingSearchSpecification = {
    /** The locations must be within the agency (prison) having this identifier. */
    agencyId?: string
    /** The appointment intervals are all on this date. */
    date?: string
    /** Specifies the desired main apointment start, end and location. */
    mainAppointment: LocationAndInterval
    /** If present specifies the desired post-appointment start, end and location. */
    postAppointment?: LocationAndInterval
    /** If present specifies the desired pre-appointment start, end and location. */
    preAppointment?: LocationAndInterval
    /** When checking that the appointment locations and intervals are free, or when searching for alternatives treat appointments for this video link booking as free */
    vlbIdToExclude?: number
  }

  export type LocationAndInterval = {
    /** If present find the locations that can be used for the pre interval. */
    interval?: Interval
    locationId: number
  }

  export type VideoLinkBookingOption = {
    /** The location (by location id) and Interval for the main appointment (the court appearance). */
    main: LocationAndInterval
    /** The location and Interval for the post-hearing appointment. */
    post?: LocationAndInterval
    /** The location and Interval for the pre-hearing appointment. */
    pre?: LocationAndInterval
  }

  export type VideoLinkBookingOptions = {
    /** If the specification could not be met then up to three alternative booking times are offered. */
    alternatives?: VideoLinkBookingOption[]
    /** True if the specified rooms are available at the specified times. */
    matched?: boolean
  }
}

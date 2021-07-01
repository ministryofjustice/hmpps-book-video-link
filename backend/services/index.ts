import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import LocationService from './locationService'
import AvailabilityCheckService from './availabilityCheckService'
import ManageCourtsService from './manageCourtsService'
import { roomFinderFactory } from './roomFinder'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi, prisonerOffenderSearchApi, userCourtPreferencesApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const availabilityCheckService = new AvailabilityCheckService(whereaboutsApi)
const manageCourtsService = new ManageCourtsService(whereaboutsApi, userCourtPreferencesApi)
const locationService = new LocationService(prisonApi, manageCourtsService, roomFinderFactory(whereaboutsApi))
const viewBookingsService = new ViewBookingsService(
  prisonApi,
  whereaboutsApi,
  prisonerOffenderSearchApi,
  locationService
)

const bookingService = new BookingService(
  prisonApi,
  whereaboutsApi,
  notificationService,
  availabilityCheckService,
  locationService
)

export const services = {
  bookingService,
  notificationService,
  locationService,
  viewBookingsService,
  availabilityCheckService,
  manageCourtsService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

export { NotificationService, AvailabilityCheckService, BookingService, LocationService }

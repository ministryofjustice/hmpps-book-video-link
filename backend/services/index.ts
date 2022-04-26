import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import LocationService from './locationService'
import RequestService from './requestService'
import ManageCourtsService from './manageCourtsService'
import { roomFinderFactory } from './roomFinder'
import AvailabilityCheckService from './availabilityCheckService'

const {
  oauthApi,
  whereaboutsApi,
  prisonApi,
  notifyApi,
  prisonerOffenderSearchApi,
  userCourtPreferencesApi,
  prisonRegisterApi,
} = apis

const notificationService = new NotificationService(oauthApi, notifyApi, prisonRegisterApi)
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

const requestService = new RequestService(whereaboutsApi, notificationService)

export const services = {
  bookingService,
  notificationService,
  locationService,
  viewBookingsService,
  availabilityCheckService,
  manageCourtsService,
  requestService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

export { NotificationService, AvailabilityCheckService, BookingService, LocationService, RequestService }

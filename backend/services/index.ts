import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import LocationService from './locationService'
import AvailabilityCheckServiceV1 from './availabilityCheckServiceV1'
import ManageCourtsService from './manageCourtsService'
import { roomFinderFactory } from './roomFinder'
import AvailabilityCheckServiceV2 from './availabilityCheckServiceV2'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi, prisonerOffenderSearchApi, userCourtPreferencesApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const availabilityCheckServiceV1 = new AvailabilityCheckServiceV1(whereaboutsApi)
const availabilityCheckServiceV2 = new AvailabilityCheckServiceV2(whereaboutsApi)
const availabilityStatusChecker = availabilityCheckServiceV2

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
  availabilityStatusChecker,
  locationService
)

export const services = {
  bookingService,
  notificationService,
  locationService,
  viewBookingsService,
  availabilityCheckServiceV1,
  availabilityCheckServiceV2,
  manageCourtsService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

export { NotificationService, AvailabilityCheckServiceV1, AvailabilityCheckServiceV2, BookingService, LocationService }

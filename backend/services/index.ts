import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import LocationService from './locationService'
import AvailabilityCheckService from './availabilityCheckService'
import ManageCourtsService from './manageCourtsService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi, prisonerOffenderSearchApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const availabilityCheckService = new AvailabilityCheckService(whereaboutsApi)
const bookingService = new BookingService(prisonApi, whereaboutsApi, notificationService, availabilityCheckService)
const locationService = new LocationService(prisonApi, whereaboutsApi)
const viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi, prisonerOffenderSearchApi)
const manageCourtsService = new ManageCourtsService(prisonApi)

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

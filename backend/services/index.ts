import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import ReferenceDataService from './referenceDataService'
import AvailabilityCheckService from './availabilityCheckService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const bookingService = new BookingService(prisonApi, whereaboutsApi, notificationService)
const referenceDataService = new ReferenceDataService(prisonApi)
const viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi)
const availabilityCheckService = new AvailabilityCheckService(whereaboutsApi)

export const services = {
  bookingService,
  notificationService,
  referenceDataService,
  viewBookingsService,
  availabilityCheckService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

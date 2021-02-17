import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import ReferenceDataService from './referenceDataService'
import AvailabilityCheckService from './availabilityCheckService'
import ManageCourtsService from './manageCourtsService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi, prisonerOffenderSearchApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const availabilityCheckService = new AvailabilityCheckService(whereaboutsApi)
const bookingService = new BookingService(prisonApi, whereaboutsApi, notificationService, availabilityCheckService)
const referenceDataService = new ReferenceDataService(prisonApi)
const viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi, prisonerOffenderSearchApi)
const manageCourtsService = new ManageCourtsService(prisonApi)

export const services = {
  bookingService,
  notificationService,
  referenceDataService,
  viewBookingsService,
  availabilityCheckService,
  manageCourtsService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

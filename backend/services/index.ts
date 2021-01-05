import { apis } from '../api'
import BookingService from './bookingService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import existingEventsServiceFactory from './existingEventsService'
import ReferenceDataService from './referenceDataService'
import AvailableSlotService from './availableSlotsService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const bookingService = new BookingService(prisonApi, whereaboutsApi, notificationService)
const referenceDataService = new ReferenceDataService(prisonApi)
const viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi)

const existingEventsService = existingEventsServiceFactory(prisonApi, referenceDataService)
const availableSlotsService = new AvailableSlotService(referenceDataService, existingEventsService)

export const services = {
  bookingService,
  availableSlotsService,
  existingEventsService,
  notificationService,
  referenceDataService,
  viewBookingsService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

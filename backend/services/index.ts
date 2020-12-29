import { apis } from '../api'
import AppointmentService from './appointmentService'
import ViewBookingsService from './viewBookingsService'
import NotificationService from './notificationService'
import existingEventsServiceFactory from './existingEventsService'
import availableSlotsServiceFactory from './availableSlotsService'
import ReferenceDataService from './referenceDataService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const appointmentService = new AppointmentService(prisonApi, whereaboutsApi, notificationService)
const referenceDataService = new ReferenceDataService(prisonApi)
const viewBookingsService = new ViewBookingsService(prisonApi, whereaboutsApi)

const existingEventsService = existingEventsServiceFactory(prisonApi, referenceDataService)
const availableSlotsService = availableSlotsServiceFactory({ existingEventsService, referenceDataService })

export const services = {
  appointmentService,
  availableSlotsService,
  existingEventsService,
  notificationService,
  referenceDataService,
  viewBookingsService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

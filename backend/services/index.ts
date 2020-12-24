import { apis } from '../api'
import AppointmentService from './appointmentService'
import BookingService from './bookingService'
import NotificationService from './notificationService'
import existingEventsServiceFactory from './existingEventsService'
import availableSlotsServiceFactory from './availableSlotsService'

const { oauthApi, whereaboutsApi, prisonApi, notifyApi } = apis

const notificationService = new NotificationService(oauthApi, notifyApi)
const appointmentService = new AppointmentService(prisonApi, whereaboutsApi, notificationService)
const bookingService = new BookingService(prisonApi, whereaboutsApi)

const existingEventsService = existingEventsServiceFactory(prisonApi, appointmentService)
const availableSlotsService = availableSlotsServiceFactory({ existingEventsService, appointmentService })

export const services = {
  appointmentService,
  availableSlotsService,
  bookingService,
  existingEventsService,
  notificationService,

  // Have to expose these as lots of routes require these directly
  ...apis,
}

export type Services = typeof services

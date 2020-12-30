import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DeleteBookingController from './deleteBookingController'
import BookingDetailsController from './bookingDetailsController'
import ChangeDateAndTimeController from './amend/changeDateAndTimeController'
import VideoLinkIsAvailableController from './amend/videoLinkIsAvailableController'
import SelectAvailableRoomsController from './amend/selectAvailableRoomsController'
import ConfirmationController from './amend/confirmationController'

export default function createRoutes({ bookingService }: Services): Router {
  const deleteBooking = new DeleteBookingController(bookingService)
  const bookingDetails = new BookingDetailsController(bookingService)
  const changeDateAndTime = new ChangeDateAndTimeController(bookingService)
  const videoLinkIsAvailable = new VideoLinkIsAvailableController(bookingService)
  const selectAvailableRooms = new SelectAvailableRoomsController(bookingService)
  const confirmation = new ConfirmationController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/booking-details/:bookingId', asyncMiddleware(bookingDetails.viewDetails()))

  router.get('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.view()))
  router.post('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.submit()))

  router.get('/video-link-is-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.view()))
  router.post('/video-link-is-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.submit()))

  router.get('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.view()))
  router.post('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.submit()))

  router.get('/video-link-amended-confirmation/:bookingId', asyncMiddleware(confirmation.view()))

  router.get('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.viewDelete()))
  router.post('/confirm-deletion/:bookingId', asyncMiddleware(deleteBooking.confirmDeletion()))

  router.get('/video-link-deleted', asyncMiddleware(deleteBooking.deleteConfirmed()))

  return router
}

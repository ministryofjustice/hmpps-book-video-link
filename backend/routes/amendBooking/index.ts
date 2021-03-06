import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import ChangeVideoLinkBookingController from './changeVideoLinkBookingController'
import dateAndTimeValidation from '../../shared/dateAndTimeValidation'
import VideoLinkIsAvailableController from './videoLinkIsAvailableController'
import VideoLinkNotAvailableController from './videoLinkNotAvailableController'
import SelectAvailableRoomsController from './selectAvailableRoomsController'
import selectAvailableRoomsValidation from './selectAvailableRoomsValidation'
import ConfirmationController from './confirmationController'
import ChangeCommentsController from './changeCommentsController'
import changeCommentsValidation from './changeCommentsValidation'

export default function createRoutes({
  bookingService,
  availabilityCheckServiceV1,
  locationService,
}: Services): Router {
  const changeVideoLinkBooking = new ChangeVideoLinkBookingController(
    bookingService,
    availabilityCheckServiceV1,
    locationService
  )
  const videoLinkIsAvailable = new VideoLinkIsAvailableController(bookingService)
  const videoLinkNotAvailable = new VideoLinkNotAvailableController()
  const selectAvailableRooms = new SelectAvailableRoomsController(bookingService, availabilityCheckServiceV1)
  const confirmation = new ConfirmationController(bookingService)
  const changeComments = new ChangeCommentsController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/start-change-date/:bookingId', asyncMiddleware(changeVideoLinkBooking.start()))
  router.get('/change-video-link-date-and-time/:bookingId', asyncMiddleware(changeVideoLinkBooking.view()))
  router.post(
    '/change-video-link-date-and-time/:bookingId',
    validationMiddleware(dateAndTimeValidation, selectAvailableRoomsValidation),
    asyncMiddleware(changeVideoLinkBooking.submit())
  )

  router.get('/video-link-not-available/:bookingId', asyncMiddleware(videoLinkNotAvailable.view()))
  router.post('/video-link-not-available/:bookingId', asyncMiddleware(videoLinkNotAvailable.submit()))
  router.get('/room-no-longer-available/:bookingId', asyncMiddleware(videoLinkNotAvailable.roomNoLongerAvailable()))

  router.get('/video-link-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.view()))

  router.get('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.view()))
  router.post(
    '/select-available-rooms/:bookingId',
    validationMiddleware(selectAvailableRoomsValidation),
    asyncMiddleware(selectAvailableRooms.submit())
  )

  router.get('/video-link-change-confirmed/:bookingId', asyncMiddleware(confirmation.view(false)))

  router.get('/change-comments/:bookingId', asyncMiddleware(changeComments.view()))
  router.post(
    '/change-comments/:bookingId',
    validationMiddleware(changeCommentsValidation),
    asyncMiddleware(changeComments.submit())
  )

  router.get('/comments-change-confirmed/:bookingId', asyncMiddleware(confirmation.view(true)))

  return router
}

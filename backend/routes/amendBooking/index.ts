import express, { Router } from 'express'
import { Services } from '../../services'
import { ensureUpdatePresentMiddleware } from './state'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import ChangeVideoLinkController from './changeVideoLinkController'
import dateAndTimeValidation from '../../shared/dateAndTimeValidation'
import VideoLinkNotAvailableController from './videoLinkNotAvailableController'
import RoomNoLongerAvailableController from './roomNoLongerAvailableController'
import ConfirmUpdatedBookingController from './confirmUpdatedBookingController'
import selectAvailableRoomsValidation from './selectAvailableRoomsValidation'
import ConfirmationController from './confirmationController'
import ChangeCommentsController from './changeCommentsController'
import changeCommentsValidation from './changeCommentsValidation'

export default function createRoutes({ bookingService, availabilityCheckService, locationService }: Services): Router {
  const changeVideoLink = new ChangeVideoLinkController(bookingService, availabilityCheckService, locationService)
  const videoLinkNotAvailable = new VideoLinkNotAvailableController(availabilityCheckService)
  const roomNoLongerAvailable = new RoomNoLongerAvailableController()
  const confirmUpdatedBooking = new ConfirmUpdatedBookingController(bookingService, locationService)
  const confirmation = new ConfirmationController(bookingService)
  const changeComments = new ChangeCommentsController(bookingService)

  const router = express.Router({ mergeParams: true })

  const checkUpdatePresent = ensureUpdatePresentMiddleware('/booking-details/')

  router.get('/start-change-booking/:bookingId', asyncMiddleware(changeVideoLink.start()))
  router.get('/change-video-link/:bookingId', asyncMiddleware(changeVideoLink.view()))
  router.post(
    '/change-video-link/:bookingId',
    validationMiddleware(dateAndTimeValidation, selectAvailableRoomsValidation),
    asyncMiddleware(changeVideoLink.submit())
  )

  router.get('/video-link-not-available/:bookingId', checkUpdatePresent, asyncMiddleware(videoLinkNotAvailable.view()))
  router.post(
    '/video-link-not-available/:bookingId',
    checkUpdatePresent,
    asyncMiddleware(videoLinkNotAvailable.submit())
  )

  router.get('/room-no-longer-available/:bookingId', checkUpdatePresent, asyncMiddleware(roomNoLongerAvailable.view()))

  router.get('/confirm-updated-booking/:bookingId', checkUpdatePresent, asyncMiddleware(confirmUpdatedBooking.view()))
  router.post(
    '/confirm-updated-booking/:bookingId',
    checkUpdatePresent,
    validationMiddleware(changeCommentsValidation),
    asyncMiddleware(confirmUpdatedBooking.submit())
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

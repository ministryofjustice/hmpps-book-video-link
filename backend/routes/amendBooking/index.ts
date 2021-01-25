import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import ChangeDateAndTimeController from './changeDateAndTimeController'
import ChangeDateAndTimeValidation from './changeDateAndTimeValidation'
import VideoLinkIsAvailableController from './videoLinkIsAvailableController'
import VideoLinkNotAvailableController from './videoLinkNotAvailableController'
import SelectAvailableRoomsController from './selectAvailableRoomsController'
import SelectAvailableRoomsValidation from './selectAvailableRoomsValidation'
import ConfirmationController from './confirmationController'
import ChangeCommentsController from './changeCommentsController'
import ChangeCommentsValidation from './changeCommentsValidation'

export default function createRoutes({ bookingService, availabilityCheckService }: Services): Router {
  const changeDateAndTime = new ChangeDateAndTimeController(bookingService, availabilityCheckService)
  const videoLinkIsAvailable = new VideoLinkIsAvailableController(bookingService)
  const videoLinkNotAvailable = new VideoLinkNotAvailableController()
  const selectAvailableRooms = new SelectAvailableRoomsController(bookingService, availabilityCheckService)
  const confirmation = new ConfirmationController(bookingService)
  const changeComments = new ChangeCommentsController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.view(false)))
  router.post(
    '/change-date-and-time/:bookingId',
    validationMiddleware(ChangeDateAndTimeValidation),
    asyncMiddleware(changeDateAndTime.submit(false))
  )

  router.get('/change-time/:bookingId', asyncMiddleware(changeDateAndTime.view(true)))
  router.post(
    '/change-time/:bookingId',
    validationMiddleware(ChangeDateAndTimeValidation),
    asyncMiddleware(changeDateAndTime.submit(true))
  )

  router.get('/video-link-not-available/:bookingId', asyncMiddleware(videoLinkNotAvailable.view()))
  router.post('/video-link-not-available/:bookingId', asyncMiddleware(videoLinkNotAvailable.submit()))

  router.get('/video-link-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.view()))
  router.post('/video-link-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.submit()))

  router.get('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.view()))
  router.post(
    '/select-available-rooms/:bookingId',
    validationMiddleware(SelectAvailableRoomsValidation),
    asyncMiddleware(selectAvailableRooms.submit())
  )

  router.get('/video-link-change-confirmed/:bookingId', asyncMiddleware(confirmation.view(false)))

  router.get('/change-comments/:bookingId', asyncMiddleware(changeComments.view()))
  router.post(
    '/change-comments/:bookingId',
    validationMiddleware(ChangeCommentsValidation),
    asyncMiddleware(changeComments.submit())
  )

  router.get('/comments-change-confirmed/:bookingId', asyncMiddleware(confirmation.view(true)))

  return router
}

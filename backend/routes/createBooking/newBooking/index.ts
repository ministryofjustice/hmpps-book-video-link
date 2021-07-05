import NewBookingController from './NewBookingController'
import validationMiddleware from '../../../middleware/validationMiddleware'
import selectCourtValidation from './selectCourtValidation'
import selectRoomsValidation from './selectRoomValidation'
import dateAndTimeValidation from '../../../shared/dateAndTimeValidation'

export { NewBookingController }

export const newBookingValidation = validationMiddleware(
  selectCourtValidation,
  dateAndTimeValidation,
  selectRoomsValidation
)

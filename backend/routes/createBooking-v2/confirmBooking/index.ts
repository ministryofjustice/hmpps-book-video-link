import ConfirmBookingController from './confirmBookingController'
import validationMiddleware from '../../../middleware/validationMiddleware'
import commentValidation from './commentValidation'

export { ConfirmBookingController }

export const confirmBookingValidation = validationMiddleware(commentValidation)

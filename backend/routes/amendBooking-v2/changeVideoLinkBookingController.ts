import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

import { DAY_MONTH_YEAR, Hours, Minutes } from '../../shared/dateHelpers'
import type CheckAvailabilityService from '../../services/availabilityCheckService'
import { ChangeDateAndTime } from './forms'
import { clearUpdate, setUpdate } from './state'

export default class ChangeVideoLinkBookingController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: CheckAvailabilityService
  ) {}

  public start(): RequestHandler {
    return (req, res) => {
      const { bookingId } = req.params
      clearUpdate(res)
      return res.redirect(`/change-video-link-date-and-time/${bookingId}`)
    }
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const errors = req.flash('errors') || []
      const [input] = req.flash('input')
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      return res.render('amendBooking-v2/changeVideoLinkBooking.njk', {
        errors,
        bookingId,
        agencyId: bookingDetails.agencyId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
        },
        form: input || {
          date: bookingDetails.date.format(DAY_MONTH_YEAR),
          court: bookingDetails.courtLocation,
          startTimeHours: Hours(bookingDetails.mainDetails.startTime),
          startTimeMinutes: Minutes(bookingDetails.mainDetails.startTime),
          endTimeHours: Hours(bookingDetails.mainDetails.endTime),
          endTimeMinutes: Minutes(bookingDetails.mainDetails.endTime),
          mainLocation: bookingDetails.mainDetails.prisonRoom,
          preAppointmentRequired: bookingDetails.preDetails ? 'yes' : 'no',
          postAppointmentRequired: bookingDetails.postDetails ? 'yes' : 'no',
        },
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', [req.body])
        return res.redirect(`/change-video-link-date-and-time/${bookingId}`)
      }

      const form = ChangeDateAndTime(req.body)

      const { isAvailable } = await this.availabilityCheckService.getAvailability(res.locals, {
        videoBookingId: parseInt(bookingId, 10),
        ...form,
      })

      setUpdate(res, form)

      return res.redirect(isAvailable ? `/video-link-available/${bookingId}` : `/video-link-not-available/${bookingId}`)
    }
  }
}

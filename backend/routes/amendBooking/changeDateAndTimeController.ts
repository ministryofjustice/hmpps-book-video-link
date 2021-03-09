import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

import { DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import type CheckAvailabilityService from '../../services/availabilityCheckService'
import { ChangeDateAndTime } from './forms'
import { clearUpdate, setUpdate } from './state'

export default class ChangeDateAndTimeController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: CheckAvailabilityService
  ) {}

  public start(): RequestHandler {
    return (req, res) => {
      const { bookingId } = req.params
      clearUpdate(res)
      return res.redirect(req.query.changeTime ? `/change-time/${bookingId}` : `/change-date-and-time/${bookingId}`)
    }
  }

  public view(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const errors = req.flash('errors') || []
      const [input] = req.flash('input')
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      return res.render('amendBooking/changeDateAndTime.njk', {
        changeTime: changeTimeView,
        errors,
        bookingId,
        agencyId: bookingDetails.agencyId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
          court: bookingDetails.courtLocation,
        },
        form: input || { date: changeTimeView ? bookingDetails.date.format(DAY_MONTH_YEAR) : null },
      })
    }
  }

  public submit(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', [req.body])
        return res.redirect(changeTimeView ? `/change-time/${bookingId}` : `/change-date-and-time/${bookingId}`)
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

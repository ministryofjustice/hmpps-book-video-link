import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import { DAY_MONTH_YEAR } from '../../shared/dateHelpers'

export = class ChangeDateAndTimeController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const errors = req.flash('errors')[0]
      const input = req.flash('input')[0]
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
        changeTime: changeTimeView,
        date: input.date || changeTimeView ? bookingDetails.date.format(DAY_MONTH_YEAR) : null,
        time: input.time || null,
        errors,
        bookingId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
          court: bookingDetails.courtLocation,
        },
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      if (req.errors) {
        req.flash('error', req.errors)
        req.flash('input', req.body)
        res.redirect('/change-date')
      }
      const { bookingId } = req.params
      res.redirect(`/video-link-available/${bookingId}`)
    }
  }
}

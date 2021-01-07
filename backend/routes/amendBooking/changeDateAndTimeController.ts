import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import { DAY_MONTH_YEAR } from '../../shared/dateHelpers'

export = class ChangeDateAndTimeController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
        changeTime: changeTimeView,
        date: changeTimeView ? bookingDetails.date.format(DAY_MONTH_YEAR) : null,
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
      const { bookingId } = req.params
      res.redirect(`/video-link-available/${bookingId}`)
    }
  }
}

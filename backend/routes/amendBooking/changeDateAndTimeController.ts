import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class ChangeDateAndTimeController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
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
      res.redirect(`/video-link-is-available/${bookingId}`)
    }
  }
}

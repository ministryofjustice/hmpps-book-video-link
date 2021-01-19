import { RequestHandler } from 'express'

export = class VideoLinkIsAvailableController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const availabilityRequested = req.flash('availabilityRequested')

      const data = {
        ...availabilityRequested[0],
        continueLink: `/change-date-and-time/${bookingId}`,
        goBack: true,
        bookingId,
      }

      req.flash('availabilityRequested', data)
      res.render('amendBooking/noAvailabilityForDateTime.njk', data)
    }
  }
}

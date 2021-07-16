import type { RequestHandler } from 'express'

export default class RoomNoLongerAvailableController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      res.render('amendBooking/roomNoLongerAvailable.njk', {
        continueLink: `/change-video-link/${bookingId}`,
      })
    }
  }
}

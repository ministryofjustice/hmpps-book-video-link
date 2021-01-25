import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class ConfirmationController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(changeCommentsView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/confirmation.njk', {
        changeComments: changeCommentsView,
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            name: bookingDetails.prisonerName,
            prison: bookingDetails.prisonName,
            prisonRoom: bookingDetails.mainDetails.prisonRoom,
          },
          hearingDetails: {
            date: bookingDetails.dateDescription,
            courtHearingStartTime: bookingDetails.mainDetails.startTime,
            courtHearingEndTime: bookingDetails.mainDetails.endTime,
            comments: bookingDetails.comments,
          },
          prePostDetails: {
            'pre-court hearing briefing': bookingDetails.preDetails?.description,
            'post-court hearing briefing': bookingDetails.postDetails?.description,
          },
          courtDetails: {
            courtLocation: bookingDetails.courtLocation,
          },
        },
      })
    }
  }
}

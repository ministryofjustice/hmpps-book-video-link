import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class BookingDetailsController {
  public constructor(private readonly bookingService: BookingService) {}

  public viewDetails(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('viewBookings/bookingDetails.njk', {
        prisonerName: bookingDetails.prisonerName,
        commentExists: !!bookingDetails.comments,
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            prison: bookingDetails.prisonName,
            prisonRoom: bookingDetails.mainDetails.prisonRoom,
          },
          hearingDetails: {
            date: bookingDetails.dateDescription,
            courtHearingStartTime: bookingDetails.mainDetails.startTime,
            courtHearingEndTime: bookingDetails.mainDetails.endTime,
            comments: bookingDetails.comments ? bookingDetails.comments : 'None provided',
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

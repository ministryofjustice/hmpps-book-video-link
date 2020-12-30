import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class ChangeDateAndTimeController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
        prisonerName: bookingDetails.prisonerName,
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            prison: bookingDetails.prisonName,
            prisonRoom: bookingDetails.mainDetails.prisonRoom,
          },
          hearingDetails: {
            date: bookingDetails.date,
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

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      res.redirect(`/video-link-is-available/${bookingId}`)
    }
  }
}

import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class VideoLinkIsAvailableController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/videoLinkIsAvailable.njk', {
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            name: bookingDetails.prisonerName,
            prison: bookingDetails.prisonName,
            court: bookingDetails.courtLocation,
          },
          hearingDetails: {
            date: bookingDetails.date,
            courtHearingStartTime: bookingDetails.mainDetails.startTime,
            courtHearingEndTime: bookingDetails.mainDetails.endTime,
          },
          prePostDetails: {
            'pre-court hearing briefing': bookingDetails.preDetails?.timings,
            'post-court hearing briefing': bookingDetails.postDetails?.timings,
          },
        },
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      res.redirect(`/select-available-rooms/${bookingId}`)
    }
  }
}

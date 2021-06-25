import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import { formatTimes, postAppointmentTimes, preAppointmentTimes } from '../../services/bookingTimes'
import { DATE_ONLY_LONG_FORMAT_SPEC, MOMENT_TIME } from '../../shared/dateHelpers'
import { getUpdate } from './state'

export default class VideoLinkIsAvailableController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      return res.render('amendBooking/videoLinkIsAvailable.njk', {
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            name: bookingDetails.prisonerName,
            prison: bookingDetails.prisonName,
            court: bookingDetails.courtLocation,
          },
          hearingDetails: {
            date: update.date.format(DATE_ONLY_LONG_FORMAT_SPEC),
            courtHearingStartTime: update.startTime.format(MOMENT_TIME),
            courtHearingEndTime: update.endTime.format(MOMENT_TIME),
          },
          prePostDetails: {
            'pre-court hearing briefing': update.preRequired && formatTimes(preAppointmentTimes(update.startTime)),
            'post-court hearing briefing': update.postRequired && formatTimes(postAppointmentTimes(update.endTime)),
          },
        },
      })
    }
  }
}

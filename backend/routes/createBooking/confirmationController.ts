import type { RequestHandler } from 'express'
import type { BookingService } from '../../services'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'

export default class ConfirmationController {
  constructor(private readonly bookingService: BookingService) {}

  public view: RequestHandler = async (req, res) => {
    const { videoBookingId } = req.params

    const details = await this.bookingService.get(res.locals, Number(videoBookingId))

    res.render('createBooking/confirmation.njk', {
      videolinkPrisonerSearchLink: '/prisoner-search',
      offender: {
        name: details.prisonerName,
        prison: details.prisonName,
        prisonRoom: details.mainDetails.prisonRoom,
      },
      details: {
        date: details.dateDescription,
        courtHearingStartTime: details.mainDetails.startTime,
        courtHearingEndTime: details.mainDetails.endTime,
        comments: details.comments,
      },
      prepostData: {
        'pre-court hearing briefing': details.preDetails?.description,
        'post-court hearing briefing': details.postDetails?.description,
      },
      court: {
        courtLocation: details.courtLocation,
      },
    })

    // TODO this should move down to the service on and happen on creation
    raiseAnalyticsEvent(
      'VLB Appointments',
      `Video link booked for ${details.courtLocation}`,
      `Pre: ${details.preDetails ? 'Yes' : 'No'} | Post: ${details.postDetails ? 'Yes' : 'No'}`
    )
  }
}

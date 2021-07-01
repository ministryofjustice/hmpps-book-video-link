import type { RequestHandler } from 'express'
import type { BookingService } from '../../services'
import LocationService from '../../services/locationService'

export default class ConfirmationController {
  constructor(private readonly bookingService: BookingService, private readonly locationService: LocationService) {}

  public view: RequestHandler = async (req, res) => {
    const { videoBookingId } = req.params

    const details = await this.bookingService.get(res.locals, Number(videoBookingId))
    const court = await this.locationService.getVideoLinkEnabledCourt(res.locals, details.courtId)

    return res.render('createBooking/confirmation.njk', {
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
        courtLocation: court.name,
      },
    })
  }
}

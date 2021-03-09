import type { RequestHandler } from 'express'
import type { BookingService } from '../../services'

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
  }
}

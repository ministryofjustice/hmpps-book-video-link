import { RequestHandler } from 'express'
import { PrisonApi } from '../../../api'

import type { BookingService, LocationService } from '../../../services'
import { getPostDescription, getPreDescription } from '../../../services/bookingTimes'
import { DATE_ONLY_LONG_FORMAT_SPEC, MOMENT_TIME } from '../../../shared/dateHelpers'
import { formatName } from '../../../utils'
import { getNewBooking, clearNewBooking } from '../state'

export default class ConfirmBookingController {
  constructor(
    private readonly locationService: LocationService,
    private readonly prisonApi: PrisonApi,
    private readonly bookingService: BookingService
  ) {}

  public view: RequestHandler = async (req, res) => {
    const { agencyId, offenderNo } = req.params

    const newBooking = getNewBooking(req)

    const [offenderDetails, agencyDetails, court, roomFinder] = await Promise.all([
      this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
      this.prisonApi.getAgencyDetails(res.locals, agencyId),
      this.locationService.getVideoLinkEnabledCourt(res.locals, newBooking.courtId),
      this.locationService.createRoomFinder(res.locals, agencyId),
    ])

    const { firstName, lastName } = offenderDetails
    const offenderNameWithNumber = formatName(firstName, lastName)

    const [input] = req.flash('input')
    const form = input || {}

    return res.render('createBooking/confirmBooking.njk', {
      agencyId,
      offenderNo,
      offender: {
        name: offenderNameWithNumber,
        prison: agencyDetails.description,
        court: court.name,
      },
      details: {
        date: newBooking.date.format(DATE_ONLY_LONG_FORMAT_SPEC),
        courtHearingStartTime: newBooking.startTime.format(MOMENT_TIME),
        courtHearingEndTime: newBooking.endTime.format(MOMENT_TIME),
        prisonRoomForCourtHearing: roomFinder.prisonRoom(newBooking.mainLocation),
        'Pre-court hearing briefing': getPreDescription(newBooking.startTime, newBooking.preRequired),
        'Prison room for pre-court hearing briefing': roomFinder.prisonRoom(newBooking.preLocation),
        'Post-court hearing briefing': getPostDescription(newBooking.endTime, newBooking.postRequired),
        'Prison room for post-court hearing briefing': roomFinder.prisonRoom(newBooking.postLocation),
      },
      errors: req.flash('errors') || [],
      form,
    })
  }

  public submit: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    if (req.errors) {
      req.flash('errors', req.errors)
      req.flash('input', req.body)
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
    }

    const form = req.body
    const newBooking = getNewBooking(req)

    const { username } = req.session.userDetails

    const success = await this.bookingService.create(res.locals, username, {
      offenderNo,
      agencyId,
      courtId: newBooking.courtId,
      mainStartTime: newBooking.startTime,
      mainEndTime: newBooking.endTime,
      pre: newBooking.preLocation,
      main: newBooking.mainLocation,
      post: newBooking.postLocation,
      comment: form.comment,
    })

    if (success === false) {
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/video-link-no-longer-available`)
    }

    clearNewBooking(res)

    const videoBookingId = success
    return res.redirect(`/offenders/${offenderNo}/confirm-appointment/${videoBookingId}`)
  }
}

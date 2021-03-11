import { RequestHandler } from 'express'

import { RoomAndComment } from './forms'
import type { AvailabilityCheckService, BookingService } from '../../services'
import { getNewBooking, DateAndTimeAndCourtCodec, clearNewBooking } from './state'

export default class SelectRoomsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  public view: RequestHandler = async (req, res) => {
    const { agencyId } = req.params

    const newBooking = getNewBooking(req, DateAndTimeAndCourtCodec)

    const {
      rooms: { pre, main, post },
    } = await this.availabilityCheckService.getAvailability(res.locals, { agencyId, ...newBooking })

    const [input] = req.flash('input')
    const form = input ? RoomAndComment(input) : {}

    res.render('createBooking/selectRooms.njk', {
      mainLocations: main,
      preLocations: pre,
      postLocations: post,
      preAppointmentRequired: newBooking.preRequired,
      postAppointmentRequired: newBooking.postRequired,
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

    const form = RoomAndComment(req.body)
    const newBooking = getNewBooking(req, DateAndTimeAndCourtCodec)

    const { username } = req.session.userDetails

    const videoBookingId = await this.bookingService.create(res.locals, username, {
      offenderNo,
      agencyId,
      court: newBooking.court,
      mainStartTime: newBooking.startTime,
      mainEndTime: newBooking.endTime,
      pre: form.preLocation,
      main: form.mainLocation,
      post: form.postLocation,
      comment: form.comment,
    })

    clearNewBooking(res)

    return res.redirect(`/offenders/${offenderNo}/confirm-appointment/${videoBookingId}`)
  }
}

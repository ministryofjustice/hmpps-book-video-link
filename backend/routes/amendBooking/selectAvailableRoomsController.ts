import { RequestHandler } from 'express'
import type AvailabilityCheckService from '../../services/availabilityCheckService'
import type BookingService from '../../services/bookingService'
import { RoomAndComment } from './forms'
import { getUpdate, clearUpdate } from './state'

export default class SelectAvailableRoomsController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const errors = req.flash('errors') || []
      const [input] = req.flash('input')

      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      const { comments } = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      const form = input ? RoomAndComment(input) : { comment: comments }

      const { rooms } = await this.availabilityCheckService.getAvailability(res.locals, {
        videoBookingId: parseInt(bookingId, 10),
        ...update,
      })

      return res.render('amendBooking/selectAvailableRooms.njk', {
        errors,
        bookingId,
        form,
        mainLocations: rooms.main,
        preLocations: rooms.pre,
        postLocations: rooms.post,
        preAppointmentRequired: update.preRequired,
        postAppointmentRequired: update.postRequired,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(`/select-available-rooms/${bookingId}`)
      }

      const update = getUpdate(req)
      const roomAndComment = RoomAndComment(req.body)

      const status = await this.bookingService.update(
        res.locals,
        req.session.userDetails.username,
        parseInt(bookingId, 10),
        { ...update, ...roomAndComment }
      )

      switch (status) {
        case 'AVAILABLE': {
          clearUpdate(res)
          return res.redirect(`/video-link-change-confirmed/${bookingId}`)
        }
        case 'NOT_AVAILABLE': {
          return res.redirect(`/video-link-not-available/${bookingId}`)
        }
        case 'NO_LONGER_AVAILABLE': {
          return res.redirect(`/room-no-longer-available/${bookingId}`)
        }
        default:
          throw Error(`Unrecognised status: ${status}`)
      }
    }
  }
}

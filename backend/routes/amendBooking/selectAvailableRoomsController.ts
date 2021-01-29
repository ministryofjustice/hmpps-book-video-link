import { RequestHandler } from 'express'
import type AvailabilityCheckService from '../../services/availabilityCheckService'
import type BookingService from '../../services/bookingService'
import { RoomAndComment } from './dtos'
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

      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      const form = input ? RoomAndComment(input) : { comment: bookingDetails.comments }

      const { rooms } = await this.availabilityCheckService.getAvailability(res.locals, {
        agencyId: bookingDetails.agencyId,
        videoBookingId: parseInt(bookingId, 10),
        date: update.date,
        startTime: update.startTime,
        endTime: update.endTime,
        preRequired: update.preAppointmentRequired,
        postRequired: update.postAppointmentRequired,
      })

      return res.render('amendBooking/selectAvailableRooms.njk', {
        errors,
        bookingId,
        form,
        mainLocations: rooms.main,
        preLocations: rooms.pre,
        postLocations: rooms.post,
        preAppointmentRequired: update.preAppointmentRequired,
        postAppointmentRequired: update.postAppointmentRequired,
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

      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      const { isAvailable } = await this.availabilityCheckService.getAvailability(res.locals, {
        agencyId: bookingDetails.agencyId,
        videoBookingId: parseInt(bookingId, 10),
        date: update.date,
        startTime: update.startTime,
        endTime: update.endTime,
        preRequired: update.preAppointmentRequired,
        postRequired: update.postAppointmentRequired,
      })

      if (!isAvailable) {
        // Belt and braces whilst awaiting new content
        throw Error('Appointment is no longer available')
      }

      await this.bookingService.update(res.locals, req.session.userDetails.username, parseInt(bookingId, 10), {
        ...update,
        ...RoomAndComment(req.body),
      })

      clearUpdate(res)
      return res.redirect(`/video-link-change-confirmed/${bookingId}`)
    }
  }
}

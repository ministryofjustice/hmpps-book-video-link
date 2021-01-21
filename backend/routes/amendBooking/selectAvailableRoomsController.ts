import { RequestHandler } from 'express'
import moment, { Moment } from 'moment'
import type AvailabilityCheckService from '../../services/availabilityCheckService'
import type BookingService from '../../services/bookingService'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'

export = class SelectAvailableRoomsController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  private formatTime(date: Moment, time: string): Moment {
    const formattedDate = date.format('YYYY-MM-DD')
    return moment(`${formattedDate}T${time}:00`, DATE_TIME_FORMAT_SPEC, true)
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const errors = req.flash('errors') || []
      const input = req.flash('input')[0] || {}
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      const { rooms } = await this.availabilityCheckService.getAvailability(res.locals, {
        agencyId: bookingDetails.agencyId,
        date: bookingDetails.date,
        startTime: this.formatTime(bookingDetails.date, bookingDetails.mainDetails.startTime),
        endTime: this.formatTime(bookingDetails.date, bookingDetails.mainDetails.endTime),
        preRequired: !!bookingDetails.preDetails,
        postRequired: !!bookingDetails.postDetails,
      })
      res.render('amendBooking/selectAvailableRooms.njk', {
        mainLocations: rooms.main,
        preLocations: rooms.pre,
        postLocations: rooms.post,
        formValues: {
          preAppointmentLocation: Number(input.selectPreAppointmentLocation) || null,
          mainAppointmentLocation: Number(input.selectMainAppointmentLocation) || null,
          postAppointmentLocation: Number(input.selectPostAppointmentLocation) || null,
          comments: input.comment || bookingDetails.comments,
        },
        preAppointmentRequired: !!bookingDetails.preDetails,
        postAppointmentRequired: !!bookingDetails.postDetails,
        errors,
        bookingId,
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
      return res.redirect(`/video-link-change-confirmed/${bookingId}`)
    }
  }
}

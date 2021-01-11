import { RequestHandler } from 'express'
import moment from 'moment'
import type BookingService from '../../services/bookingService'
import type ExistingEventsService from '../../services/existingEventsService'

export = class SelectAvailableRoomsController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly existingEventsService: ExistingEventsService
  ) {}

  private formatTime(date: string, time: string): string {
    const formattedDate = moment(date, 'D MMMM YYYY').format('YYYY-MM-DD')
    return `${formattedDate}T${time}:00`
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      const {
        mainLocations,
        preLocations,
        postLocations,
      } = await this.existingEventsService.getAvailableLocationsForVLB(res.locals, {
        agencyId: bookingDetails.agencyId,
        startTime: this.formatTime(bookingDetails.date, bookingDetails.mainDetails.startTime),
        endTime: this.formatTime(bookingDetails.date, bookingDetails.mainDetails.endTime),
        date: moment(bookingDetails.date, 'D MMMM YYYY').format('DD/MM/YYYY'),
        preAppointmentRequired: bookingDetails.preDetails ? 'yes' : 'no',
        postAppointmentRequired: bookingDetails.postDetails ? 'yes' : 'no',
      })
      res.render('amendBooking/selectAvailableRooms.njk', {
        mainLocations,
        preLocations,
        postLocations,
        preAppointmentRequired: !!bookingDetails.preDetails,
        postAppointmentRequired: !!bookingDetails.postDetails,
        comments: bookingDetails.comments,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      res.redirect(`/video-link-change-confirmed/${bookingId}`)
    }
  }
}

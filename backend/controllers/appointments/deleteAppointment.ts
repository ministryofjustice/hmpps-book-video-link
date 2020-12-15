import { Request, Response } from 'express'
import AppointmentsService from '../../services/appointmentsService'

export = class DeleteAppointmentController {
  public constructor(private readonly appointmentsService: AppointmentsService) {}

  private get() {
    return async (req: Request, res: Response) => {
      const { bookingId } = req.params
      const bookingDetails = await this.appointmentsService.getBookingDetails(res.locals, parseInt(bookingId, 10))
      req.flash('confirmDelete', req.body.confirmDelete)
      res.render('deleteAppointment/videolinkBookingConfirmDelete.njk', { bookingDetails, errors: req.flash('errors') })
    }
  }

  private post() {
    return async (req: Request, res: Response): Promise<void> => {
      const { bookingId } = req.params
      if (req.body.confirmDelete === 'yes') {
        const offenderNameAndBookingIds = await this.appointmentsService.deleteBooking(
          res.locals,
          parseInt(bookingId, 10)
        )

        req.flash('offenderName', offenderNameAndBookingIds.offenderName)
        req.flash('offenderNo', offenderNameAndBookingIds.offenderNo)

        res.redirect('/court/booking-delete-confirmed')
      }

      if (req.body.confirmDelete === 'no') {
        res.redirect('/bookings')
      }

      if (!req.body.confirmDelete) {
        const errors = [
          {
            text: 'Select Yes or No',
            href: '#confirm-delete',
          },
        ]
        req.flash('errors', errors)
        res.redirect(`/delete-booking/${bookingId}`)
      }
    }
  }

  public viewDelete = this.get()

  public confirmDelete = this.post()
}

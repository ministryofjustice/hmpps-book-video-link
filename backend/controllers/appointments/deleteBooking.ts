import { RequestHandler } from 'express'
import AppointmentsService from '../../services/appointmentsService'

export = class DeleteBookingController {
  public constructor(private readonly appointmentsService: AppointmentsService) {}

  public viewDelete(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.appointmentsService.getBookingDetails(res.locals, parseInt(bookingId, 10))
      res.render('deleteAppointment/confirmDeleteBooking.njk', {
        bookingDetails,
        errors: req.flash('errors'),
      })
    }
  }

  public confirmDelete(): RequestHandler {
    return async (req, res): Promise<void> => {
      const { bookingId } = req.params

      if (!req.body.confirmDelete) {
        const errors = [
          {
            text: 'Select Yes or No',
            href: '#confirm-delete',
          },
        ]
        req.flash('errors', errors)
        return res.redirect(`/delete-booking/${bookingId}`)
      }

      if (req.body.confirmDelete === 'no') {
        return res.redirect('/bookings')
      }

      const offenderNameAndBookingIds = await this.appointmentsService.deleteBooking(
        res.locals,
        parseInt(bookingId, 10)
      )

      req.flash('offenderName', offenderNameAndBookingIds.offenderName)
      req.flash('offenderNo', offenderNameAndBookingIds.offenderNo)

      return res.redirect('/booking-delete-confirmed')
    }
  }

  public deleteConfirmed(): RequestHandler {
    return (req, res) => {
      const { offenderName, offenderNo } = req.flash()
      if (!offenderName) {
        return res.redirect('/bookings')
      }
      return res.render('deleteAppointment/bookingDeleteConfirmed.njk', {
        offenderName: offenderName[0],
        offenderNo: offenderNo[0],
      })
    }
  }
}

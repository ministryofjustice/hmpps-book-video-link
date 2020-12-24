import { RequestHandler } from 'express'
import type AppointmentService from '../../services/appointmentService'

export = class DeleteBookingController {
  public constructor(private readonly appointmentService: AppointmentService) {}

  public viewDelete(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.appointmentService.getBookingDetails(res.locals, parseInt(bookingId, 10))
      res.render('deleteAppointment/confirmDeletion.njk', {
        bookingDetails: {
          videoBookingId: bookingDetails.videoBookingId,
          details: {
            name: bookingDetails.prisonerName,
            prison: bookingDetails.prisonName,
            prisonRoom: bookingDetails.mainDetails.prisonRoom,
          },
          hearingDetails: {
            date: bookingDetails.date,
            courtHearingStartTime: bookingDetails.mainDetails.startTime,
            courtHearingEndTime: bookingDetails.mainDetails.endTime,
            comments: bookingDetails.comments,
          },
          prePostDetails: {
            'pre-court hearing briefing': bookingDetails.preDetails?.description,
            'post-court hearing briefing': bookingDetails.postDetails?.description,
          },
          courtDetails: {
            courtLocation: bookingDetails.courtLocation,
          },
        },
        errors: req.flash('errors'),
      })
    }
  }

  public confirmDeletion(): RequestHandler {
    return async (req, res): Promise<void> => {
      const { bookingId } = req.params

      if (!req.body.confirmDeletion) {
        const errors = [
          {
            text: 'Select Yes or No',
            href: '#confirm-deletion',
          },
        ]
        req.flash('errors', errors)
        return res.redirect(`/confirm-deletion/${bookingId}`)
      }

      if (req.body.confirmDeletion === 'no') {
        return res.redirect('/bookings')
      }

      const offenderIdentifiers = await this.appointmentService.deleteBooking(
        res.locals,
        req.session.userDetails.username,
        parseInt(bookingId, 10)
      )

      req.flash('offenderName', offenderIdentifiers.offenderName)
      req.flash('offenderNo', offenderIdentifiers.offenderNo)

      return res.redirect('/video-link-deleted')
    }
  }

  public deleteConfirmed(): RequestHandler {
    return (req, res) => {
      const { offenderName, offenderNo } = req.flash()
      if (!offenderName) {
        return res.redirect('/bookings')
      }
      return res.render('deleteAppointment/videoLinkDeleted.njk', {
        offenderName: offenderName[0],
        offenderNo: offenderNo[0],
      })
    }
  }
}

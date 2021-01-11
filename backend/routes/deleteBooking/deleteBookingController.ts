import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class DeleteBookingController {
  public constructor(private readonly bookingService: BookingService) {}

  public viewDelete(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('deleteBooking/confirmDeletion.njk', {
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
            href: '#delete-booking',
          },
        ]
        req.flash('errors', errors)
        return res.redirect(`/delete-booking/${bookingId}`)
      }

      if (req.body.confirmDeletion === 'no') {
        return res.redirect('/bookings')
      }

      const offenderIdentifiers = await this.bookingService.delete(
        res.locals,
        req.session.userDetails.username,
        parseInt(bookingId, 10)
      )

      req.flash('offenderName', offenderIdentifiers.offenderName)
      req.flash('offenderNo', offenderIdentifiers.offenderNo)

      return res.redirect('/booking-deleted')
    }
  }

  public deleteConfirmed(): RequestHandler {
    return (req, res) => {
      const { offenderName, offenderNo } = req.flash()
      if (!offenderName) {
        return res.redirect('/bookings')
      }
      return res.render('deleteBooking/videoLinkDeleted.njk', {
        offenderName: offenderName[0],
        offenderNo: offenderNo[0],
      })
    }
  }
}

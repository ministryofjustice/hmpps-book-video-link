import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'

export = class SelectAvailableRoomsController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const errors = req.flash('errors') || []
      const input = req.flash('input')[0] || {}
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeComments.njk', {
        formValues: {
          comments: input.comment || bookingDetails.comments,
        },
        errors,
        bookingId,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const updatedComment = req.body.comment
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(`/change-comments/${bookingId}`)
      }
      await this.bookingService.updateComments(
        res.locals,
        req.session.userDetails.username,
        parseInt(bookingId, 10),
        updatedComment
      )
      return res.redirect(`/comments-change-confirmed/${bookingId}`)
    }
  }
}

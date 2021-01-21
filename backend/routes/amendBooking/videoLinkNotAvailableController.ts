import { RequestHandler } from 'express'

export = class VideoLinkNotAvailableController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const input = req.flash('input')[0]
      res.render('amendBooking/noAvailabilityForDateTime.njk', { input, bookingId })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const input = {
        date: req.body.dateSlashSeparated,
        startTimeHours: req.body.startTimeHours,
        startTimeMinutes: req.body.startTimeMinutes,
        endTimeHours: req.body.startTimeMinutes,
        endTimeMinutes: req.body.endTimeMinutes,
        preAppointmentRequired: req.body.preAppointmentRequired,
        postAppointmentRequired: req.body.postAppointmentRequired,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        prisoner: req.body.prisoner,
        locations: req.body.locations,
      }

      req.flash('input', input)
      res.redirect(`/change-Date-And-Time/${bookingId}`)
    }
  }
}

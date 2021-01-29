import { RequestHandler } from 'express'
import { getTotalAppointmentInterval } from '../../services/bookingTimes'
import { DATE_ONLY_EXTRA_LONG_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { getUpdate } from './state'

export default class VideoLinkNotAvailableController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      const totalInterval = getTotalAppointmentInterval(
        update.startTime,
        update.endTime,
        update.preAppointmentRequired,
        update.postAppointmentRequired
      )

      return res.render('amendBooking/videoLinkNotAvailable.njk', {
        data: {
          date: update.date.format(DATE_ONLY_EXTRA_LONG_FORMAT_SPEC),
          startTime: totalInterval.start,
          endTime: totalInterval.end,
        },
        bookingId,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      req.flash('input', {
        date: update.date.format(DAY_MONTH_YEAR),
        startTimeHours: update.startTime.format('HH'),
        startTimeMinutes: update.startTime.format('mm'),
        endTimeHours: update.endTime.format('HH'),
        endTimeMinutes: update.endTime.format('mm'),
        preAppointmentRequired: update.preAppointmentRequired ? 'yes' : 'no',
        postAppointmentRequired: update.postAppointmentRequired ? 'yes' : 'no',
      })

      return res.redirect(`/change-date-and-time/${bookingId}`)
    }
  }

  public roomNoLongerAvailable(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      return res.render('amendBooking/roomNoLongerAvailable.njk', { bookingId })
    }
  }
}

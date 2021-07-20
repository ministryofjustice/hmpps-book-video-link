import { RequestHandler } from 'express'
import type { AvailabilityCheckService } from '../../services'
import { getPostDescription, getPreDescription } from '../../services/bookingTimes'
import {
  buildDateWithTime,
  DATE_TIME_FORMAT_SPEC,
  DATE_ONLY_LONG_FORMAT_SPEC,
  MOMENT_TIME,
} from '../../shared/dateHelpers'
import { SelectAlternative } from './forms'
import { getUpdate, setUpdate } from './state'

export default class VideoLinkNotAvailableController {
  constructor(private readonly availabilityCheckService: AvailabilityCheckService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      const { alternatives } = await this.availabilityCheckService.getAvailability(res.locals, {
        videoBookingId: parseInt(bookingId, 10),
        ...update,
      })

      return res.render('amendBooking/videoLinkNotAvailable.njk', {
        alternatives: alternatives.map(a => {
          const startDate = buildDateWithTime(update.date, a.main.interval.start)
          const endDate = buildDateWithTime(update.date, a.main.interval.end)
          const pre = getPreDescription(startDate, update.preRequired)
          const post = getPostDescription(endDate, update.postRequired)

          return {
            values: {
              startTime: startDate.format(DATE_TIME_FORMAT_SPEC),
              endTime: endDate.format(DATE_TIME_FORMAT_SPEC),
            },
            rows: [
              { name: 'Date', value: update.date.format(DATE_ONLY_LONG_FORMAT_SPEC) },
              { name: 'Court hearing start time', value: startDate.format(MOMENT_TIME) },
              { name: 'Court hearing end time', value: endDate.format(MOMENT_TIME) },
              pre ? { name: 'Pre-court hearing briefing', value: pre } : {},
              post ? { name: 'Post-court hearing briefing', value: post } : {},
            ],
          }
        }),
        continueLink: `/change-video-link/${bookingId}`,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const form = SelectAlternative(req.body)
      const update = getUpdate(req)
      if (!update) {
        return res.redirect(`/booking-details/${bookingId}`)
      }

      setUpdate(res, { ...update, ...form })

      return res.redirect(`/confirm-updated-booking/${bookingId}`)
    }
  }
}

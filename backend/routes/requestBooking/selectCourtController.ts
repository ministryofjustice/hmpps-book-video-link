import { RequestHandler, Request } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } from '../../shared/dateHelpers'
import { getPostAppointmentInterval, getPreAppointmentInterval } from '../../services/bookingTimes'
import type LocationService from '../../services/locationService'

export default class SelectCourtController {
  public constructor(private readonly locationService: LocationService) {}

  private extractObjectFromFlash({ req, key }) {
    return req.flash(key).reduce(
      (acc, current) => ({
        ...acc,
        ...current,
      }),
      {}
    )
  }

  private packBookingDetails(req: Request, data?) {
    return req.flash('requestBooking', data)
  }

  private getBookingDetails(req: Request) {
    return this.extractObjectFromFlash({ req, key: 'requestBooking' })
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const errors = req.flash('errors')
      const { username } = res.locals.user
      const courtLocations = await this.locationService.getVideoLinkEnabledCourts(res.locals, username)
      const details = this.getBookingDetails(req)
      if (!Object.keys(details).length) return res.redirect('/')

      const { date, startTime, endTime, prison, preAppointmentRequired, postAppointmentRequired } = details

      const getPreHearingStartAndEndTime = () => {
        if (preAppointmentRequired !== 'yes') return 'Not required'
        const { start: preStart, end: preEnd } = getPreAppointmentInterval(moment(startTime, DATE_TIME_FORMAT_SPEC))
        return `${preStart} to ${preEnd}`
      }

      const getPostCourtHearingStartAndEndTime = () => {
        if (postAppointmentRequired !== 'yes') return 'Not required'
        const { start: postStart, end: postEnd } = getPostAppointmentInterval(moment(endTime, DATE_TIME_FORMAT_SPEC))
        return `${postStart} to ${postEnd}`
      }

      const preHearingStartAndEndTime = getPreHearingStartAndEndTime()
      const postHearingStartAndEndTime = getPostCourtHearingStartAndEndTime()

      this.packBookingDetails(req, {
        ...details,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      })

      const matchingPrison = await this.locationService.getMatchingPrison(res.locals, prison)

      return res.render('requestBooking/selectCourt.njk', {
        prisonDetails: {
          prison: matchingPrison.description,
        },
        hearingDetails: {
          date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
          courtHearingStartTime: Time(startTime),
          courtHearingEndTime: Time(endTime),
        },
        prePostDetails: {
          'pre-court hearing briefing': preHearingStartAndEndTime,
          'post-court hearing briefing': postHearingStartAndEndTime,
        },
        hearingLocations: courtLocations.map(c => ({ value: c.id, text: c.name })),
        errors,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { courtId } = req.body

      if (req.errors) {
        req.flash('errors', req.errors)
        return res.redirect('/request-booking/select-court')
      }
      const court = await this.locationService.getVideoLinkEnabledCourt(res.locals, courtId)
      const bookingDetails = this.getBookingDetails(req)
      this.packBookingDetails(req, {
        ...bookingDetails,
        hearingLocation: court.name,
      })
      return res.redirect('/request-booking/enter-offender-details')
    }
  }
}

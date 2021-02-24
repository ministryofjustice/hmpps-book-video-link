import { RequestHandler, Request } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } from '../../shared/dateHelpers'
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
      const courtLocations = await this.locationService.getVideoLinkCourtLocations(res.locals)
      const details = this.getBookingDetails(req)
      const { date, startTime, endTime, prison, preAppointmentRequired, postAppointmentRequired } = details

      const getPreHearingStartAndEndTime = () => {
        if (preAppointmentRequired !== 'yes') return 'Not required'
        const preCourtHearingStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minute')
        const preCourtHearingEndTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
        return `${Time(preCourtHearingStartTime)} to ${Time(preCourtHearingEndTime)}`
      }

      const getPostCourtHearingStartAndEndTime = () => {
        if (postAppointmentRequired !== 'yes') return 'Not required'
        const postCourtHearingStartTime = moment(endTime, DATE_TIME_FORMAT_SPEC)
        const postCourtHearingEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minute')
        return `${Time(postCourtHearingStartTime)} to ${Time(postCourtHearingEndTime)}`
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
        hearingLocations: courtLocations,
        errors,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { hearingLocation } = req.body
      const bookingDetails = this.getBookingDetails(req)
      this.packBookingDetails(req, {
        ...bookingDetails,
        hearingLocation,
      })
      if (req.errors) {
        req.flash('errors', req.errors)
        return res.redirect('/request-booking/select-court')
      }
      return res.redirect('/request-booking/enter-offender-details')
    }
  }
}

import moment from 'moment'

import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, buildDateTime } from '../../shared/dateHelpers'
import CheckAvailabilityService from '../../services/availabilityCheckService'
import { AvailabilityRequest } from '../../services/model'

export = class ChangeDateAndTimeController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: CheckAvailabilityService
  ) {}

  public view(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const errors = req.flash('errors') || []
      const input = req.flash('input')[0] || {}
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
        changeTime: changeTimeView,
        date: input.date || (changeTimeView ? bookingDetails.date.format(DAY_MONTH_YEAR) : null),
        startTimeHours: input.startTimeHours || null,
        startTimeMinutes: input.startTimeMinutes || null,
        endTimeHours: input.endTimeHours || null,
        endTimeMinutes: input.endTimeMinutes || null,
        preAppointmentRequired: input.preAppointmentRequired || null,
        postAppointmentRequired: input.postAppointmentRequired || null,
        errors,
        bookingId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
          court: bookingDetails.courtLocation,
        },
      })
    }
  }

  public submit(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(changeTimeView ? `/change-time/${bookingId}` : `/change-date-and-time/${bookingId}`)
      }

      const {
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        preAppointmentRequired,
        postAppointmentRequired,
      } = req.body

      const { agencyId, prisonerName, prisonName, courtLocation } = await this.bookingService.get(
        res.locals,
        parseInt(bookingId, 10)
      )
      const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
      const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

      const availabilityRequest = {
        date,
        startTime,
        endTime,
        preAppointmentRequired,
        postAppointmentRequired,
      }

      const { isAvailable } = await this.availabilityCheckService.getAvailability(
        res.locals,
        parseAvailabilityRequest(agencyId, availabilityRequest)
      )

      const availabilityRequestEnhanced = {
        dateSlashSeparated: date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        preAppointmentRequired,
        postAppointmentRequired,
        date: startTime.format('dddd D MMMM YYYY'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        prisoner: {
          name: prisonerName,
        },
        locations: {
          prison: prisonName,
          court: courtLocation,
        },
      }

      req.flash('input', availabilityRequestEnhanced)

      if (isAvailable) {
        return res.redirect(`/video-link-available/${bookingId}`)
      }

      return res.redirect(`/video-link-not-available/${bookingId}`)
    }
  }
}

function parseAvailabilityRequest(agencyId: string, obj: Record<string, unknown>): AvailabilityRequest {
  return {
    agencyId,
    date: moment(obj.date, DAY_MONTH_YEAR, true),
    startTime: moment(obj.startTime, DATE_TIME_FORMAT_SPEC, true),
    endTime: moment(obj.endTime, DATE_TIME_FORMAT_SPEC, true),
    preRequired: obj.preAppointmentRequired === 'yes',
    postRequired: obj.postAppointmentRequired === 'yes',
  }
}

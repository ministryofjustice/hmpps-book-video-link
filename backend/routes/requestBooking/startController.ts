import { RequestHandler, Request } from 'express'
import moment from 'moment'

import { buildDate, DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import type LocationService from '../../services/locationService'

export default class StartController {
  public constructor(private readonly locationService: LocationService) {}

  private packBookingDetails(req: Request, data?) {
    return req.flash('requestBooking', data)
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const errors = req.flash('errors')
      const [input] = req.flash('input')
      const prisonDropdownValues = (await this.locationService.getVideoLinkEnabledPrisons(res.locals)).map(prison => ({
        text: prison.description,
        value: prison.agencyId,
        selected: prison.agencyId === input?.prison,
      }))

      return res.render('requestBooking/requestBooking.njk', {
        prisons: prisonDropdownValues,
        errors,
        formValues: input,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const {
        prison,
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        preAppointmentRequired,
        postAppointmentRequired,
      } = req.body

      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', [req.body])
        return res.redirect('/request-booking')
      }

      const startTime = buildDate(date, startTimeHours, startTimeMinutes)
      const endTime = buildDate(date, endTimeHours, endTimeMinutes)

      this.packBookingDetails(req, {
        prison,
        date,
        startTime: moment(startTime).format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime && moment(endTime).format(DATE_TIME_FORMAT_SPEC),
        preAppointmentRequired,
        postAppointmentRequired,
      })

      return res.redirect('/request-booking/select-court')
    }
  }
}

import moment from 'moment'
import { RequestHandler, Request, Response } from 'express'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, buildDate } from '../../shared/dateHelpers'
import { formatName } from '../../utils'
import type PrisonApi from '../../api/prisonApi'
import type AvailabilityCheckService from '../../services/availabilityCheckService'

export default class StartController {
  public constructor(
    private readonly prisonApi: PrisonApi,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { offenderNo, agencyId } = req.params
      const [offenderDetails, agencyDetails] = await Promise.all([
        this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
        this.prisonApi.getAgencyDetails(res.locals, agencyId),
      ])
      const { firstName, lastName, bookingId } = offenderDetails
      const offenderNameWithNumber = `${formatName(firstName, lastName)} (${offenderNo})`
      const agencyDescription = agencyDetails.description

      return res.render('createBooking/start.njk', {
        offenderNo,
        offenderNameWithNumber,
        agencyDescription,
        bookingId,
        errors: req.flash('errors') || [],
        formValues: req.flash('formValues')[0] || {},
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { offenderNo, agencyId } = req.params

      if (req.errors && req.errors.length > 0) {
        req.flash('errors', req.errors)
        req.flash('formValues', req.body)
        return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment`)
      }

      const {
        bookingId,
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        preAppointmentRequired,
        postAppointmentRequired,
      } = req.body

      const startTime = buildDate(date, startTimeHours, startTimeMinutes)
      const endTime = buildDate(date, endTimeHours, endTimeMinutes)

      const request = {
        agencyId,
        date: moment(date, DAY_MONTH_YEAR, true),
        startTime: moment(startTime, DATE_TIME_FORMAT_SPEC, true),
        endTime: moment(endTime, DATE_TIME_FORMAT_SPEC, true),
        preRequired: preAppointmentRequired === 'yes',
        postRequired: postAppointmentRequired === 'yes',
      }

      const { isAvailable, totalInterval } = await this.availabilityCheckService.getAvailability(res.locals, request)

      if (!isAvailable) {
        return res.render('createBooking/noAvailabilityForDateTime.njk', {
          date: request.startTime.format('dddd D MMMM YYYY'),
          startTime: totalInterval.start,
          endTime: totalInterval.end,
          continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
        })
      }

      req.flash('appointmentDetails', {
        bookingId,
        date,
        startTime: moment(startTime).format(DATE_TIME_FORMAT_SPEC),
        endTime: moment(endTime).format(DATE_TIME_FORMAT_SPEC),
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        preAppointmentRequired,
        postAppointmentRequired,
        agencyId,
      })
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-court`)
    }
  }
}

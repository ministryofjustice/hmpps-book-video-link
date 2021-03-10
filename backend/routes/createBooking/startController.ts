import { RequestHandler, Request, Response } from 'express'
import { formatName } from '../../utils'
import type PrisonApi from '../../api/prisonApi'
import type AvailabilityCheckService from '../../services/availabilityCheckService'
import { ChangeDateAndTime } from './forms'
import { clearNewBooking, DateAndTimeCodec, setNewBooking } from './state'

export default class StartController {
  public constructor(
    private readonly prisonApi: PrisonApi,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  public start(): RequestHandler {
    return (req, res) => {
      const { agencyId, offenderNo } = req.params
      clearNewBooking(res)
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment`)
    }
  }

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
        errors: req.flash('errors'),
        formValues: req.flash('formValues')[0],
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { offenderNo, agencyId } = req.params

      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('formValues', req.body)
        return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment`)
      }

      const form = ChangeDateAndTime(req.body)

      const { isAvailable, totalInterval } = await this.availabilityCheckService.getAvailability(res.locals, {
        agencyId,
        ...form,
      })

      if (!isAvailable) {
        return res.render('createBooking/noAvailabilityForDateTime.njk', {
          date: form.date.format('dddd D MMMM YYYY'),
          startTime: totalInterval.start,
          endTime: totalInterval.end,
          continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
        })
      }

      setNewBooking(res, DateAndTimeCodec, form)

      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-court`)
    }
  }
}

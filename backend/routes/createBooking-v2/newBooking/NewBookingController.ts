import { RequestHandler, Request, Response } from 'express'
import { formatName } from '../../../utils'
import type PrisonApi from '../../../api/prisonApi'
import type AvailabilityCheckService from '../../../services/availabilityCheckService'
import type { LocationService } from '../../../services'
import { NewBooking } from './form'
import { clearNewBooking, setNewBooking } from '../state'

export default class NewBookingController {
  public constructor(
    private readonly prisonApi: PrisonApi,
    private readonly availabilityCheckService: AvailabilityCheckService,
    private readonly locationService: LocationService
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
      const { username } = res.locals.user

      const [offenderDetails, agencyDetails, courts, rooms] = await Promise.all([
        this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
        this.prisonApi.getAgencyDetails(res.locals, agencyId),
        this.locationService.getVideoLinkEnabledCourts(res.locals, username),
        this.locationService.getRooms(res.locals, agencyId),
      ])
      const { firstName, lastName, bookingId } = offenderDetails
      const offenderNameWithNumber = `${formatName(firstName, lastName)} (${offenderNo})`
      const agencyDescription = agencyDetails.description

      return res.render('createBooking-v2/newBooking.njk', {
        rooms,
        offenderNo,
        offenderNameWithNumber,
        agencyDescription,
        bookingId,
        courts: courts.map(c => ({ value: c.id, text: c.name })),
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

      const form = NewBooking(req.body)

      const { isAvailable } = await this.availabilityCheckService.getAvailability(res.locals, {
        agencyId,
        ...form,
      })

      setNewBooking(res, form)

      return res.redirect(
        isAvailable
          ? `/${agencyId}/offenders/${offenderNo}/add-court-appointment/confirm-booking`
          : `/${agencyId}/offenders/${offenderNo}/add-court-appointment/video-link-not-available`
      )
    }
  }
}

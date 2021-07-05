import type { RequestHandler } from 'express'
import type { AvailabilityCheckServiceV2 } from '../../../services'
import { getNewBooking } from '../state'

export default class NotAvailableController {
  constructor(private readonly availabilityCheckService: AvailabilityCheckServiceV2) {}

  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const newBooking = getNewBooking(req)

    const { totalInterval } = await this.availabilityCheckService.getAvailability(res.locals, {
      agencyId,
      ...newBooking,
    })

    return res.render('createBooking/notAvailable.njk', {
      date: newBooking.date.format('dddd D MMMM YYYY'),
      startTime: totalInterval.start,
      endTime: totalInterval.end,
      continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
    })
  }
}

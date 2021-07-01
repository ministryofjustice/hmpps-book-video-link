import type { RequestHandler } from 'express'
import type { AvailabilityCheckService } from '../../../services'
import { getNewBooking } from '../state'

export default class NotAvailableController {
  constructor(private readonly availabilityCheckService: AvailabilityCheckService) {}

  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const newBooking = getNewBooking(req)

    const { totalInterval } = await this.availabilityCheckService.getAvailability(res.locals, {
      agencyId,
      ...newBooking,
    })

    return res.render('createBooking-v2/notAvailable.njk', {
      date: newBooking.date.format('dddd D MMMM YYYY'),
      startTime: totalInterval.start,
      endTime: totalInterval.end,
      continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
    })
  }
}

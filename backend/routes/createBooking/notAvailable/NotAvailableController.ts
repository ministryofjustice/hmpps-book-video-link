import type { RequestHandler } from 'express'
import type { AvailabilityCheckServiceV2 } from '../../../services'
import { getPostDescription, getPreDescription } from '../../../services/bookingTimes'
import {
  buildDateWithTime,
  DATE_ONLY_LONG_FORMAT_SPEC,
  DATE_TIME_FORMAT_SPEC,
  MOMENT_TIME,
} from '../../../shared/dateHelpers'
import { SelectAlternative } from '../newBooking/form'
import { getNewBooking, setNewBooking } from '../state'

export default class NotAvailableController {
  constructor(private readonly availabilityCheckService: AvailabilityCheckServiceV2) {}

  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const newBooking = getNewBooking(req)

    const { alternatives } = await this.availabilityCheckService.getAvailability(res.locals, {
      agencyId,
      ...newBooking,
    })

    return res.render('createBooking/notAvailable.njk', {
      alternatives: alternatives.map(a => {
        const startDate = buildDateWithTime(newBooking.date, a.main.interval.start)
        const endDate = buildDateWithTime(newBooking.date, a.main.interval.end)
        const pre = getPreDescription(startDate, newBooking.preRequired)
        const post = getPostDescription(endDate, newBooking.postRequired)

        return {
          values: {
            startTime: startDate.format(DATE_TIME_FORMAT_SPEC),
            endTime: endDate.format(DATE_TIME_FORMAT_SPEC),
          },
          rows: [
            { name: 'Date', value: newBooking.date.format(DATE_ONLY_LONG_FORMAT_SPEC) },
            { name: 'Court hearing start time', value: startDate.format(MOMENT_TIME) },
            { name: 'Court hearing end time', value: endDate.format(MOMENT_TIME) },
            pre ? { name: 'Pre-court hearing briefing', value: pre } : {},
            post ? { name: 'Post-court hearing briefing', value: post } : {},
          ],
        }
      }),
      continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
    })
  }

  public submit: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const form = SelectAlternative(req.body)
    const newBooking = getNewBooking(req)

    setNewBooking(res, { ...newBooking, ...form })

    return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/confirm-booking`)
  }
}

import { RequestHandler } from 'express'

import type { Services } from '../services'
import { DateAndTimeCodec, getNewBooking } from '../routes/createBooking/state'

export default function createCheckAvailability({ availabilityCheckService }: Services): RequestHandler {
  return async (req, res, next) => {
    const { offenderNo, agencyId } = req.params
    const { preLocation, mainLocation, postLocation } = req.body
    const newBooking = getNewBooking(req, DateAndTimeCodec)

    const { isAvailable, rooms, totalInterval } = await availabilityCheckService.getAvailability(res.locals, {
      agencyId,
      ...newBooking,
    })

    if (!isAvailable) {
      return res.render('createBooking/noAvailabilityForDateTime.njk', {
        date: newBooking.startTime.format('dddd D MMMM YYYY'),
        startTime: totalInterval.start,
        endTime: totalInterval.end,
        continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
      })
    }

    if (
      !availabilityCheckService.isStillAvailable(
        { pre: Number(preLocation), main: Number(mainLocation), post: Number(postLocation) },
        rooms
      )
    ) {
      return res.render('createBooking/roomNoLongerAvailable.njk', {
        continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`,
      })
    }

    return next()
  }
}

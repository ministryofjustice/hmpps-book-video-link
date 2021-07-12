import type { RequestHandler } from 'express'

export default class RoomNoLongerAvailableController {
  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    res.render('createBooking/roomNoLongerAvailable.njk', {
      continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
    })
  }
}

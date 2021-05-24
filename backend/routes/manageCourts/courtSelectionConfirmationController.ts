import { RequestHandler } from 'express'
import type ManageCourtsService from '../../services/manageCourtsService'

export default class CourtSelectionConfirmationController {
  public constructor(private readonly manageCourtsService: ManageCourtsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { username } = res.locals.user
      req.session.preferredCourts = undefined
      const courts = await this.manageCourtsService.getSelectedCourts(res.locals, username)
      res.render('manageCourts/courtSelectionConfirmation.njk', {
        courts,
      })
    }
  }
}

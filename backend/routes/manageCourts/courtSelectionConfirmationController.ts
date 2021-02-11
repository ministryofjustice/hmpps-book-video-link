import { RequestHandler } from 'express'
import type ManageCourtsService from '../../services/manageCourtsService'

export default class CourtSelectionConfirmationController {
  public constructor(private readonly manageCourtsService: ManageCourtsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      res.render('manageCourts/courtSelectionConfirmation.njk', {})
    }
  }
}

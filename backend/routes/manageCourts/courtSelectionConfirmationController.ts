import { RequestHandler } from 'express'

export default class CourtSelectionConfirmationController {
  public view(): RequestHandler {
    return async (req, res) => {
      res.render('manageCourts/courtSelectionConfirmation.njk', {})
    }
  }
}

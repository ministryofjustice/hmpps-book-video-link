import { RequestHandler } from 'express'
import type ManageCourtsService from '../../services/manageCourtsService'

export = class ManageCourtsController {
  public constructor(private readonly manageCourtsService: ManageCourtsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const errors = req.flash('errors') || []
      const courts = await this.manageCourtsService.getCourtsByLetter(res.locals)
      res.render('manageCourts/manageCourts.njk', {
        courts,
        errors,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      if (req.errors) {
        req.flash('errors', req.errors)
        return res.redirect('/manage-courts')
      }

      return res.redirect('/court-list-updated')
    }
  }
}

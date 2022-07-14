import type { RequestHandler } from 'express'

export default class IndexController {
  public viewSelectionPage: RequestHandler = async (req, res) => {
    const errors = req.flash('errors') || []
    return res.render('downloadReports/index.njk', {
      formValues: req.query,
      errors,
    })
  }

  public submitSelection: RequestHandler = async (req, res) => {
    const { option } = req.body
    switch (option) {
      case 'DATE_OF_BOOKING_WAS_MADE':
        return res.redirect('/download-by-booking-date')
      case 'DATE_OF_HEARING':
        return res.redirect('/download-by-hearing-date')
      default: {
        req.flash('errors', [{ text: 'Select a download type', href: '#option' }])
        return res.redirect(`/video-link-booking-events`)
      }
    }
  }
}

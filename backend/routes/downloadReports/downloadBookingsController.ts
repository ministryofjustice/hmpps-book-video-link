import type { RequestHandler } from 'express'
import moment from 'moment'
import type WhereaboutsApi from '../../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasOptionalStringValues } from '../../utils'
import eventsValidation from './eventsValidation'
import startDateValidation from './startDateValidation'

export default class BookingsController {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  public viewBookingPage: RequestHandler = async (req, res) => {
    const hasSubmitted = Object.keys(req.query).length > 0
    if (!hasSubmitted) {
      return res.render('downloadReports/downloadByBooking.njk', { errors: [], formValues: {} })
    }

    const errors = eventsValidation(req.query)
    const downloadPath = errors.length < 1 ? getDownloadPathBooking(req.query) : undefined
    return res.render('downloadReports/downloadByBooking.njk', {
      errors,
      formValues: req.query,
      downloadPath,
    })
  }

  public getCsvBooking: RequestHandler = (req, res) => {
    const { query } = req
    assertHasOptionalStringValues(query, ['start-date', 'days'])
    const startDate = moment(query['start-date'], DATE_ONLY_FORMAT_SPEC, true)
    const days = query.days ? Number(query.days) : 7

    if (!startDate.isValid() || Number.isNaN(days)) {
      res.sendStatus(400)
    } else {
      res.contentType('text/csv')
      res.set('Content-Disposition', attachmentTextBooking(startDate, days))

      this.whereaboutsApi.getVideoLinkBookingsCSV(res.locals, res, startDate, days)
    }
  }
}

const getDownloadPathBooking = query => {
  const { startDay, startMonth, startYear, days } = query
  const { startDate } = startDateValidation(startDay, startMonth, startYear)
  return `/video-link-booking-events-csv?start-date=${startDate.format(DATE_ONLY_FORMAT_SPEC)}&days=${days}`
}

const attachmentTextBooking = (startDate: moment.Moment, days: number) =>
  `attachment;filename=video-link-bookings-from-${startDate.format(DATE_ONLY_FORMAT_SPEC)}-for-${days}-days.csv`

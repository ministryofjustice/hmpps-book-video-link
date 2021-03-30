import type { RequestHandler } from 'express'
import moment from 'moment'
import type WhereaboutsApi from '../../api/whereaboutsApi'
import { DATE_ONLY_FORMAT_SPEC } from '../../shared/dateHelpers'
import { assertHasOptionalStringValues } from '../../utils'
import eventsValidation from './eventsValidation'
import startDateValidation from './startDateValidation'

export default class EventsController {
  constructor(private readonly whereaboutsApi: WhereaboutsApi) {}

  public view: RequestHandler = async (req, res) => {
    const hasSubmitted = Object.keys(req.query).length > 0
    if (!hasSubmitted) {
      return res.render('events/index.njk', { errors: [], formValues: {} })
    }

    const errors = eventsValidation(req.query)
    const downloadPath = errors.length < 1 ? getDownloadPath(req.query) : undefined
    return res.render('events/index.njk', {
      errors,
      formValues: req.query,
      downloadPath,
    })
  }

  public getCsv: RequestHandler = (req, res) => {
    const { query } = req
    assertHasOptionalStringValues(query, ['start-date', 'days'])
    const startDate = moment(query['start-date'], DATE_ONLY_FORMAT_SPEC, true)
    const days = query.days ? Number(query.days) : 7

    if (!startDate.isValid() || Number.isNaN(days)) {
      res.sendStatus(400)
    } else {
      res.contentType('text/csv')
      res.set('Content-Disposition', attachmentText(startDate, days))

      this.whereaboutsApi.getVideoLinkBookingEvents(res.locals, res, startDate, days)
    }
  }
}

const getDownloadPath = query => {
  const { startDay, startMonth, startYear, days } = query
  const { startDate } = startDateValidation(startDay, startMonth, startYear)
  return `/video-link-booking-events-csv?start-date=${startDate.format(DATE_ONLY_FORMAT_SPEC)}&days=${days}`
}

const attachmentText = (startDate: moment.Moment, days: number) =>
  `attachment;filename=video-link-booking-events-from-${startDate.format(DATE_ONLY_FORMAT_SPEC)}-for-${days}-days.csv`

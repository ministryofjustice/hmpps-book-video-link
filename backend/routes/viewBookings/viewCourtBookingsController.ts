import { RequestHandler } from 'express'
import moment from 'moment'
import type ViewBookingsService from '../../services/viewBookingsService'

export = (viewBookingsService: ViewBookingsService): RequestHandler => async (req, res) => {
  const { date, courtOption } = req.query as { date: string; courtOption?: string }
  const searchDate = date ? moment(date as string, 'D MMMM YYYY') : moment()

  const { appointments, courts } = await viewBookingsService.getList(res.locals, searchDate, courtOption)

  const title = `Video link bookings for ${moment(searchDate).format('D MMMM YYYY')}`

  return res.render('viewBookings/index.njk', {
    courts: [...courts.map(key => ({ value: key, text: key })), { value: 'Other', text: 'Other' }],
    courtOption,
    appointments,
    date: searchDate,
    title: courtOption ? `${title} - ${courtOption}` : title,
    hearingDescriptions: { PRE: 'Pre-court hearing', MAIN: 'Court hearing', POST: 'Post-court hearing' },
  })
}

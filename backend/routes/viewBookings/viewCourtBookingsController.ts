import { RequestHandler } from 'express'
import moment from 'moment'
import type ViewBookingsService from '../../services/viewBookingsService'

export = (viewBookingsService: ViewBookingsService): RequestHandler =>
  async (req, res) => {
    const { date, courtId } = req.query as { date?: string; courtId?: string }
    const searchDate = date ? moment(date as string, 'D MMMM YYYY') : moment()
    const { username } = res.locals.user

    const { appointments, courts } = await viewBookingsService.getList(res.locals, searchDate, courtId, username)

    return res.render('viewBookings/index.njk', {
      courts: courts.map(court => ({ value: court.value, text: court.text })),
      courtId,
      appointments,
      date: searchDate,
      hearingDescriptions: { PRE: 'Pre-court hearing', MAIN: 'Court hearing', POST: 'Post-court hearing' },
    })
  }

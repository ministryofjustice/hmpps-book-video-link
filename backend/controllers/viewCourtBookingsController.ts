import { RequestHandler } from 'express'
import moment from 'moment'
import BookingService from '../services/bookingService'

export = (bookingService: BookingService): RequestHandler => async (req, res) => {
  const { date, courtOption } = req.query as { date: string; courtOption?: string }
  const searchDate = date ? moment(date as string, 'D MMMM YYYY') : moment()
  const user = {
    displayName: req.session.userDetails.name,
  }

  const { appointments, courts } = await bookingService.getAppointmentList(res.locals, searchDate, courtOption)

  const title = `Video link bookings for ${moment(searchDate).format('D MMMM YYYY')}`

  return res.render('viewCourtBookings.njk', {
    courts: [...courts.map(key => ({ value: key, text: key })), { value: 'Other', text: 'Other' }],
    courtOption,
    appointments,
    user,
    date: searchDate,
    title: courtOption ? `${title} - ${courtOption}` : title,
    hearingDescriptions: { PRE: 'Pre-court hearing', MAIN: 'Court hearing', POST: 'Post-court hearing' },
  })
}

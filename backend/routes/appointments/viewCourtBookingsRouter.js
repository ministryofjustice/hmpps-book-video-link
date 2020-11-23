const moment = require('moment')
const { getTime, properCaseName } = require('../../utils')

module.exports = ({ prisonApi, whereaboutsApi }) => async (req, res) => {
  const { date, courtOption } = req.query
  const searchDate = date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
  // FIXME: Temporary fix while waiting for new API
  const agencyId = 'WWI'
  const user = {
    displayName: req.session.userDetails.name,
  }

  const getCourts = async context => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(context)

    const courts = courtLocations.sort().reduce((courtList, court) => {
      return { ...courtList, [court]: court }
    }, {})

    return courts
  }

  // FIXME: Replace with API with returns appointments for whole estate
  const [courts, appointments] = await Promise.all([
    getCourts(res.locals),
    prisonApi.getAppointmentsForAgency(res.locals, {
      agencyId,
      date: searchDate,
    }),
  ])

  const videoLinkAppointmentIds = appointments
    .filter(appointment => appointment.appointmentTypeCode === 'VLB')
    .map(videoLinkAppointment => videoLinkAppointment.id)

  const videoLinkAppointmentResponse = await whereaboutsApi.getVideoLinkAppointments(
    res.locals,
    videoLinkAppointmentIds
  )
  const videoLinkAppointments = (videoLinkAppointmentResponse && videoLinkAppointmentResponse.appointments) || []

  const videoLinkAppointmentsEnhanced = videoLinkAppointments.map(videoLink => {
    const originalApp = appointments.find(appointment => appointment.id === videoLink.appointmentId)
    return {
      ...videoLink,
      ...originalApp,
    }
  })

  const filterVideoLinkCourt = (option, videoLinkCourt) => {
    if (option === 'Other') {
      // If the user has selected Other, return the video links for courts
      // that are not part of our list
      return !Object.keys(courts).includes(videoLinkCourt)
    }
    return option === videoLinkCourt
  }

  const appointmentsEnhanced = videoLinkAppointmentsEnhanced
    .filter(videoLink => (courtOption ? filterVideoLinkCourt(courtOption, videoLink.court) : true))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map(videoLink => {
      const { startTime, endTime, locationDescription, court } = videoLink
      const offenderName = `${properCaseName(videoLink.firstName)} ${properCaseName(videoLink.lastName)}`

      return [
        {
          text: endTime ? `${getTime(startTime)} to ${getTime(endTime)}` : getTime(startTime),
        },
        {
          text: offenderName,
        },
        {
          text: locationDescription,
        },
        {
          text: court || 'Not available',
        },
      ]
    })

  const title = `Video link bookings for ${moment(searchDate).format('D MMMM YYYY')}`

  const courtOptions = Object.keys(courts).map(key => ({ value: key, text: courts[key] }))
  courtOptions.push({ value: 'Other', text: 'Other' })

  return res.render('viewCourtBookings.njk', {
    courts: courtOptions,
    courtOption,
    appointmentRows: appointmentsEnhanced,
    user,
    date: moment(searchDate).format('DD/MM/YYYY'),
    title: courtOption ? `${title} - ${courtOption}` : title,
  })
}

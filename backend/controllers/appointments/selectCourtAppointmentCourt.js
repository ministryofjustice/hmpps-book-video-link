const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, Time } = require('../../shared/dateHelpers')
const { toAppointmentDetailsSummary } = require('../../services/appointmentsService')

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

  return appointmentDetails.reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )
}

const selectCourtAppointmentCourtFactory = (prisonApi, whereaboutsApi) => {
  const getCourts = async context => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(context)

    const courts = courtLocations.sort().reduce((courtList, court) => {
      const key = court.replace(/\W+/g, '-').toLowerCase()
      return { ...courtList, [key]: court }
    }, {})

    return courts
  }

  const renderTemplate = async (req, res, pageData) => {
    const appointmentDetails = unpackAppointmentDetails(req)
    const { offenderNo, agencyId } = req.params

    const [offenderDetails, agencyDetails] = await Promise.all([
      prisonApi.getPrisonerDetails(res.locals, offenderNo),
      prisonApi.getAgencyDetails(res.locals, agencyId),
    ])
    const courts = await getCourts(res.locals)
    const { firstName, lastName } = offenderDetails
    const { startTime, endTime, preAppointmentRequired, postAppointmentRequired } = appointmentDetails

    req.flash('appointmentDetails', appointmentDetails)

    const details = toAppointmentDetailsSummary({
      firstName,
      lastName,
      startTime,
      endTime,
      agencyDescription: agencyDetails.description,
    })

    const prePostData = {}

    if (preAppointmentRequired === 'yes') {
      prePostData['pre-court hearing briefing'] = `${Time(
        moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minutes')
      )} to ${details.startTime}`
    }

    if (postAppointmentRequired === 'yes') {
      prePostData['post-court hearing briefing'] = `${details.endTime} to ${Time(
        moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minutes')
      )}`
    }

    return res.render('addAppointment/selectCourtAppointmentCourt.njk', {
      ...pageData,
      courts: Object.keys(courts).map(key => ({ value: key, text: courts[key] })),
      offender: {
        name: details.prisonerName,
        prison: details.prison,
      },
      details: {
        date: details.date,
        courtHearingStartTime: details.startTime,
        courtHearingEndTime: details.endTime,
      },
      prePostData,
    })
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const { court } = req.body
    const appointmentDetails = unpackAppointmentDetails(req)

    if (!court) {
      req.flash('appointmentDetails', appointmentDetails)

      return renderTemplate(req, res, {
        errors: [{ text: 'Select which court you are in', href: '#court' }],
      })
    }

    const courts = await getCourts(res.locals)

    req.flash('appointmentDetails', { ...appointmentDetails, court: courts[court] })

    return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
  }

  return { index, post }
}

module.exports = {
  selectCourtAppointmentCourtFactory,
}

const moment = require('moment')

const { DATE_TIME_FORMAT_SPEC, Time } = require('../../shared/dateHelpers')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const { prepostDurations } = require('../../shared/appointmentConstants')

const { formatName } = require('../../utils')

const confirmAppointmentFactory = ({ prisonApi, appointmentService }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const { locationTypes } = await appointmentService.getAppointmentOptions(res.locals, activeCaseLoadId)

    const appointmentDetails = req.flash('appointmentDetails')
    if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

    const {
      locationId,
      startTime,
      endTime,
      comment,
      preAppointment,
      postAppointment,
      agencyDescription,
      court,
    } = appointmentDetails.reduce(
      (acc, current) => ({
        ...acc,
        ...current,
      }),
      {}
    )

    const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
    const { firstName, lastName } = await prisonApi.getPrisonerDetails(res.locals, offenderNo)

    const prepostData = {}

    const preAppointmentData = preAppointment &&
      preAppointment.locationId && {
        locationDescription: locationTypes.find(l => l.value === Number(preAppointment.locationId)).text,
        duration: prepostDurations[preAppointment.duration],
      }
    const postAppointmentData = postAppointment &&
      postAppointment.locationId && {
        locationDescription: locationTypes.find(l => l.value === Number(postAppointment.locationId)).text,
        duration: prepostDurations[postAppointment.duration],
      }

    if (preAppointmentData) {
      prepostData['pre-court hearing briefing'] = `${preAppointmentData.locationDescription} - ${moment(
        preAppointment.startTime,
        DATE_TIME_FORMAT_SPEC
      ).format('HH:mm')} to ${moment(preAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`
    }

    if (postAppointmentData) {
      prepostData['post-court hearing briefing'] = `${postAppointmentData.locationDescription} - ${moment(
        postAppointment.startTime,
        DATE_TIME_FORMAT_SPEC
      ).format('HH:mm')} to ${moment(postAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`
    }

    res.render('videolinkBookingConfirmHearingCourt.njk', {
      title: 'The video link has been booked',
      videolinkPrisonerSearchLink: '/prisoner-search',
      offender: {
        name: formatName(firstName, lastName),
        prison: agencyDescription,
        prisonRoom: locationDescription,
      },
      details: {
        date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
        courtHearingStartTime: Time(startTime),
        courtHearingEndTime: endTime && Time(endTime),
        comments: comment,
      },
      prepostData,
      court: {
        courtLocation: court,
      },
    })

    raiseAnalyticsEvent(
      'VLB Appointments',
      `Video link booked for ${court}`,
      `Pre: ${preAppointment ? 'Yes' : 'No'} | Post: ${postAppointment ? 'Yes' : 'No'}`
    )
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}

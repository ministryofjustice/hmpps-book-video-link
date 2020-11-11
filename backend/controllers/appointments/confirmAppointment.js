const moment = require('moment')

const { DATE_TIME_FORMAT_SPEC } = require('../../shared/dateHelpers')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const { serviceUnavailableMessage } = require('../../common-messages')

const { prepostDurations } = require('../../shared/appointmentConstants')
const { toAppointmentDetailsSummary } = require('../../services/appointmentsService')

const confirmAppointmentFactory = ({ prisonApi, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const { locationTypes } = await appointmentsService.getAppointmentOptions(res.locals, activeCaseLoadId)

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
      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

      const details = toAppointmentDetailsSummary({
        firstName,
        lastName,
        location: locationDescription,
        startTime,
        endTime,
        comment,
        court,
      })

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
          name: details.prisonerName,
          prison: agencyDescription,
          prisonRoom: details.location,
        },
        details: {
          date: details.date,
          courtHearingStartTime: details.startTime,
          courtHearingEndTime: details.endTime,
          comments: details.comment,
        },
        prepostData,
        court: {
          courtLocation: details.court,
        },
        homeUrl: '/',
      })

      raiseAnalyticsEvent(
        'VLB Appointments',
        `Video link booked for ${details.court}`,
        `Pre: ${preAppointment ? 'Yes' : 'No'} | Post: ${postAppointment ? 'Yes' : 'No'}`
      )
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      const pageData = {
        url: '/prisoner-search',
        homeUrl: '/',
      }
      res.render('courtServiceError.njk', pageData)
    }
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}

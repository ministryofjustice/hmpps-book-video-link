const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, Time } = require('../shared/dateHelpers')
const { properCaseName } = require('../utils')

/**
 * TODO need to tidy this up and remove workout what is and isn't optional
 *
 * @param {object} params
 * @param {string} [params.firstName]
 * @param {string} [params.lastName]
 * @param {any} [params.location]
 * @param {any} [params.startTime]
 * @param {any} [params.endTime]
 * @param {any} [params.comment]
 * @param {string} [params.agencyDescription]
 * @param {any} [params.court]
 */
const toAppointmentDetailsSummary = ({
  firstName,
  lastName,
  location,
  startTime,
  endTime,
  comment,
  agencyDescription,
  court,
}) => ({
  prisonerName: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
  prison: agencyDescription,
  location,
  date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
  startTime: Time(startTime),
  endTime: endTime && Time(endTime),
  comment,
  court,
})

const mapLocationType = location => ({
  value: location.locationId,
  text: location.userDescription || location.description,
})

const mapAppointmentType = appointment => ({
  value: appointment.code,
  text: appointment.description,
})

const appointmentsServiceFactory = (prisonApi, whereaboutsApi) => {
  const getVideoLinkLocations = async (context, agency) =>
    (await prisonApi.getLocationsForAppointments(context, agency))
      .filter(loc => loc.locationType === 'VIDE')
      .map(mapLocationType)

  const getAppointmentOptions = async (context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      prisonApi.getLocationsForAppointments(context, agency),
      prisonApi.getAppointmentTypes(context),
    ])

    return {
      locationTypes: locationTypes && locationTypes.map(mapLocationType),
      appointmentTypes: appointmentTypes && appointmentTypes.map(mapAppointmentType),
    }
  }

  const createAppointmentRequest = async (
    appointmentDetails,
    comment,
    prepostAppointments,
    mainLocationId,
    context
  ) => {
    const appointment = {
      bookingId: appointmentDetails.bookingId,
      court: appointmentDetails.court,
      madeByTheCourt: true,
      main: {
        locationId: parseInt(mainLocationId, 10),
        startTime: appointmentDetails.startTime,
        endTime: appointmentDetails.endTime,
      },
    }

    if (comment) {
      appointment.comment = comment
    }

    if (prepostAppointments.preAppointment) {
      appointment.pre = prepostAppointments.preAppointment
    }

    if (prepostAppointments.postAppointment) {
      appointment.post = prepostAppointments.postAppointment
    }

    await whereaboutsApi.createVideoLinkBooking(context, appointment)
  }

  return {
    getAppointmentOptions,
    getVideoLinkLocations,
    createAppointmentRequest,
  }
}

module.exports = {
  appointmentsServiceFactory,
  toAppointmentDetailsSummary,
}

const contextProperties = require('../contextProperties')
const { mapToQueryString } = require('../utils')

const prisonApiFactory = client => {
  const processResponse = context => response => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url, resultsLimit) => client.get(context, url, resultsLimit).then(processResponse(context))

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const userLocations = context => (context.authSource !== 'auth' ? get(context, '/api/users/me/locations') : [])

  const getActivityList = (context, { agencyId, locationId, usage, date, timeSlot }) =>
    get(
      context,
      `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?${
        timeSlot ? `timeSlot=${timeSlot}&` : ''
      }date=${date}`
    )

  const getAppointments = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(
      context,
      `/api/schedules/${agencyId}/appointments?${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}`,
      offenderNumbers
    )

  const getAppointmentsForAgency = (context, { agencyId, date, locationId, timeSlot }) => {
    const searchParams = mapToQueryString({
      date,
      locationId,
      timeSlot,
    })

    return get(context, `/api/schedules/${agencyId}/appointments?${searchParams}`)
  }

  const getActivities = (context, { agencyId, date, timeSlot, offenderNumbers }) =>
    post(
      context,
      `/api/schedules/${agencyId}/activities?${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}`,
      offenderNumbers
    )

  const getAgencies = context => get(context, '/api/agencies/prison')

  const getAgencyDetails = (context, agencyId) => get(context, `/api/agencies/${agencyId}?activeOnly=false`)

  const getCourtEvents = (context, { agencyId, date, offenderNumbers }) =>
    post(context, `/api/schedules/${agencyId}/courtEvents?date=${date}`, offenderNumbers)

  const globalSearch = (context, params, resultsLimit) => {
    const { offenderNo, lastName, firstName, gender, location, dateOfBirth, includeAliases } = params

    const searchParams = mapToQueryString({
      offenderNo,
      lastName,
      firstName,
      gender,
      location,
      dob: dateOfBirth,
      partialNameMatch: false,
      includeAliases,
    })
    return get(context, `/api/prisoners?${searchParams}`, resultsLimit)
  }

  const getDetails = (context, offenderNo, fullInfo = false) =>
    get(context, `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}`)

  const getLocation = (context, livingUnitId) => get(context, `/api/locations/${livingUnitId}`)

  const getLocationsForAppointments = (context, agencyId) =>
    get(context, `/api/agencies/${agencyId}/locations?eventType=APP`)

  const getAppointmentTypes = context => get(context, '/api/reference-domains/scheduleReasons?eventType=APP')

  const addAppointments = (context, body) => post(context, '/api/appointments', body)

  const getPrisonerDetails = (context, offenderNo) => get(context, `/api/prisoners/${offenderNo}`)

  return {
    userLocations,
    getActivityList,
    getAppointments,
    getAppointmentsForAgency,
    getActivities,
    getAgencies,
    getAgencyDetails,
    getCourtEvents,
    globalSearch,
    getDetails,
    getLocation,
    getLocationsForAppointments,
    getAppointmentTypes,
    addAppointments,
    getPrisonerDetails,
  }
}

module.exports = { prisonApiFactory }

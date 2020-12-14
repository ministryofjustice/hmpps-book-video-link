const auth = require('../mockApis/auth')
const prisonApi = require('../mockApis/prisonApi')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')

const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: resetStubs,
    resetAndStubTokenVerification: async () => {
      await resetStubs()
      return tokenverification.stubVerifyToken(true)
    },
    stubAuthHealth: status => auth.stubHealth(status),
    stubPrisonApiHealth: status => prisonApi.stubHealth(status),
    stubWhereaboutsHealth: status => whereabouts.stubHealth(status),
    stubTokenverificationHealth: status => tokenverification.stubHealth(status),

    stubHealthAllHealthy: () =>
      Promise.all([
        auth.stubHealth(),
        prisonApi.stubHealth(),
        whereabouts.stubHealth(),
        tokenverification.stubHealth(),
      ]),
    getLoginUrl: auth.getLoginUrl,
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt(), tokenverification.stubVerifyToken(true)]),

    stubUserEmail: username => auth.stubEmail(username),
    stubUser: (username, caseload) => auth.stubUser(username, caseload),
    stubCourts: courts => whereabouts.stubCourtLocations(courts),
    stubGroups: caseload => whereabouts.stubGroups(caseload),
    stubCreateVideoLinkBooking: () => whereabouts.stubCreateVideoLinkBooking(),
    getBookingRequest: () => whereabouts.getBookingRequest(),
    stubGetVideoLinkBookings: ({ date, bookings }) => whereabouts.stubGetVideoLinkBookings(date, bookings),

    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubOffenderBasicDetails: basicDetails => Promise.all([prisonApi.stubOffenderBasicDetails(basicDetails)]),
    stubAppointmentTypes: types => Promise.all([prisonApi.stubAppointmentTypes(types)]),
    stubActivityLocations: status => prisonApi.stubActivityLocations(status),
    stubAgencyDetails: ({ agencyId, details }) => Promise.all([prisonApi.stubAgencyDetails(agencyId, details)]),
    stubAppointmentLocations: ({ agency, locations }) =>
      Promise.all([prisonApi.stubAppointmentLocations(agency, locations)]),
    stubAgencies: agencies => Promise.all([prisonApi.stubAgencies(agencies)]),
    stubAppointmentsAtAgencyLocation: ({ agency, location, date, appointments }) =>
      Promise.all([prisonApi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments)]),
    stubUserMeRoles: roles => auth.stubUserMeRoles(roles),
    stubUserMe: () => auth.stubUserMe(),
    stubPrisonApiGlobalSearch: prisonApi.stubPrisonApiGlobalSearch,
    stubLocationGroups: locationGroups => whereabouts.stubLocationGroups(locationGroups),
    stubOffenderBookings: bookings => prisonApi.stubOffenderBookings(bookings),
  })
}

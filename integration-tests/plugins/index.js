const { rmdir } = require('fs')
const auth = require('../mockApis/auth')
const prisonApi = require('../mockApis/prisonApi')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const prisonerOffenderSearch = require('../mockApis/prisonerOffenderSearch')

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
        prisonerOffenderSearch.stubHealth(),
      ]),
    getLoginUrl: auth.getLoginUrl,
    stubLoginCourt: user => Promise.all([auth.stubLoginCourt(user), tokenverification.stubVerifyToken(true)]),

    stubUserEmail: username => auth.stubEmail(username),
    stubUser: (username, caseload) => auth.stubUser(username, caseload),
    stubCourts: courts => whereabouts.stubCourtLocations(courts),
    stubGroups: caseload => whereabouts.stubGroups(caseload),
    stubCreateVideoLinkBooking: () => whereabouts.stubCreateVideoLinkBooking(),
    getBookingRequest: () => whereabouts.getBookingRequest(),
    getFindAvailabilityRequests: () => whereabouts.getFindAvailabilityRequests(),
    stubGetVideoLinkBookings: ({ agencyId, date, bookings }) =>
      whereabouts.stubGetVideoLinkBookings(agencyId, date, bookings),
    stubGetVideoLinkBooking: booking => whereabouts.stubGetVideoLinkBooking(booking),
    getUpdateCommentRequest: () => whereabouts.getUpdateCommentRequest(),
    stubUpdateVideoLinkBookingComment: videoBookingId => whereabouts.stubUpdateVideoLinkBookingComment(videoBookingId),
    getUpdateBookingRequest: () => whereabouts.getUpdateBookingRequest(),
    stubUpdateVideoLinkBooking: videoBookingId => whereabouts.stubUpdateVideoLinkBooking(videoBookingId),
    stubDeleteVideoLinkBooking: videoBookingId => whereabouts.stubDeleteVideoLinkBooking(videoBookingId),
    stubRoomAvailability: locations => whereabouts.stubRoomAvailability(locations),

    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubOffenderBasicDetails: basicDetails => Promise.all([prisonApi.stubOffenderBasicDetails(basicDetails)]),
    stubActivityLocations: status => prisonApi.stubActivityLocations(status),
    stubAllCourts: prisonApi.stubAllCourts,
    stubAgencyDetails: ({ agencyId, details }) => Promise.all([prisonApi.stubAgencyDetails(agencyId, details)]),
    stubAppointmentLocations: ({ agency, locations }) =>
      Promise.all([prisonApi.stubAppointmentLocations(agency, locations)]),
    stubAgencies: agencies => Promise.all([prisonApi.stubAgencies(agencies)]),
    stubUserMeRoles: roles => auth.stubUserMeRoles(roles),
    stubUserMe: me => auth.stubUserMe(me),
    stubPrisonApiGlobalSearch: prisonApi.stubPrisonApiGlobalSearch,
    stubLocationGroups: locationGroups => whereabouts.stubLocationGroups(locationGroups),
    stubOffenderBooking: ({ bookingId, response }) => prisonApi.stubOffenderBooking(bookingId, response),
    stubLocation: ({ locationId, response }) => prisonApi.stubLocation(locationId, response),

    stubFindPrisonersByBookingIds: prisonerOffenderSearch.stubFindPrisonersByBookingIds,

    stubGetEventsCsv: body => whereabouts.stubGetEventsCsv(body),

    deleteFolder: folderName => {
      console.log('deleting folder %s', folderName)

      return new Promise((resolve, reject) => {
        rmdir(folderName, { maxRetries: 10, recursive: true }, err => {
          if (err) {
            console.error(err)
            return reject(err)
          }
          return resolve(null)
        })
      })
    },
  })
}

import { defineConfig } from 'cypress'

import { rm } from 'fs'
import auth from './integration-tests/mockApis/auth'
import prisonApi from './integration-tests/mockApis/prisonApi'
import prisonRegisterApi from './integration-tests/mockApis/prisonRegisterApi'
import whereabouts from './integration-tests/mockApis/whereabouts'
import tokenverification from './integration-tests/mockApis/tokenverification'
import prisonerOffenderSearch from './integration-tests/mockApis/prisonerOffenderSearch'

import { resetStubs } from './integration-tests/mockApis/wiremock'
import userCourtPreferencesApi from './integration-tests/mockApis/userCourtPreferencesApi'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration-tests/fixtures',
  screenshotsFolder: 'integration-tests/screenshots',
  videosFolder: 'integration-tests/videos',
  viewportWidth: 1000,
  viewportHeight: 1500,
  downloadsFolder: 'integration-tests/downloads',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.json',
  },
  taskTimeout: 200000,
  pageLoadTimeout: 200000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        resetAndStubTokenVerification: async () => {
          await resetStubs()
          return tokenverification.stubVerifyToken(true)
        },
        stubAuthHealth: status => auth.stubHealth(status),
        stubPrisonApiHealth: status => prisonApi.stubHealth(status),
        // These are not used - remove if no problem
        // stubWhereaboutsHealth: status => whereabouts.stubHealth(status),
        // stubTokenverificationHealth: status => tokenverification.stubHealth(status),

        stubHealthAllHealthy: () =>
          Promise.all([
            auth.stubHealth(),
            prisonApi.stubHealth(),
            whereabouts.stubHealth(),
            tokenverification.stubHealth(),
            prisonerOffenderSearch.stubHealth(),
            prisonRegisterApi.stubHealth(),
          ]),
        getLoginUrl: auth.getLoginUrl,
        stubLoginCourt: ({ user = {}, preferredCourts = ['ABDRCT'] }) =>
          Promise.all([
            auth.stubLoginCourt(user),
            whereabouts.stubCourts(),
            userCourtPreferencesApi.stubGetUserCourtPreferences(preferredCourts),
            tokenverification.stubVerifyToken(true),
          ]),

        stubUserEmail: username => auth.stubEmail(username),
        stubUser: username => auth.stubUser(username),
        stubCourts: () => whereabouts.stubCourts(),
        stubCourtEmailAddress: court => whereabouts.stubCourtEmailAddress(court),
        stubGroups: caseload => whereabouts.stubGroups(caseload),
        stubCreateVideoLinkBooking: () => whereabouts.stubCreateVideoLinkBooking(),
        getBookingRequest: () => whereabouts.getBookingRequest(),
        stubFindVideoLinkBookings: ({ date, bookings }) => whereabouts.stubFindVideoLinkBookings(date, bookings),
        stubGetVideoLinkBooking: booking => whereabouts.stubGetVideoLinkBooking(booking),
        getUpdateCommentRequest: () => whereabouts.getUpdateCommentRequest(),
        stubUpdateVideoLinkBookingComment: videoBookingId =>
          whereabouts.stubUpdateVideoLinkBookingComment(videoBookingId),
        getUpdateBookingRequest: () => whereabouts.getUpdateBookingRequest(),
        stubUpdateVideoLinkBooking: videoBookingId => whereabouts.stubUpdateVideoLinkBooking(videoBookingId),
        stubDeleteVideoLinkBooking: videoBookingId => whereabouts.stubDeleteVideoLinkBooking(videoBookingId),
        stubAvailabilityCheck: result => whereabouts.stubAvailabilityCheck(result),
        getAvailabilityCheckRequests: () => whereabouts.getAvailabilityCheckRequests(),
        stubRoomAvailability: locations => whereabouts.stubRoomAvailability(locations),
        getFindAvailabilityRequests: () => whereabouts.getFindAvailabilityRequests(),
        stubGetRooms: ({ agencyId, rooms }) => whereabouts.stubGetRooms(agencyId, rooms),

        stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
        stubLoginPage: auth.redirect,
        stubOffenderBasicDetails: basicDetails => Promise.all([prisonApi.stubOffenderBasicDetails(basicDetails)]),
        stubActivityLocations: status => prisonApi.stubActivityLocations(status),
        stubGetUserCourtPreferences: ({ courts }) => userCourtPreferencesApi.stubGetUserCourtPreferences(courts),
        stubUpdateUserCourtPreferences: ({ courts }) => userCourtPreferencesApi.stubUpdateUserCourtPreferences(courts),
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
        stubGetBookingsCsv: body => whereabouts.stubGetBookingsCsv(body),

        deleteFolder: folderName => {
          console.log('deleting folder %s', folderName)

          return new Promise((resolve, reject) => {
            rm(folderName, { maxRetries: 10, recursive: true, force: true }, err => {
              if (err) {
                console.error(err)
                return reject(err)
              }
              return resolve(null)
            })
          })
        },
      })
    },
    baseUrl: 'http://localhost:3008',
    excludeSpecPattern: '**/!(*.cy).js',
    specPattern: 'integration-tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration-tests/support/index.js',
    experimentalRunAllSpecs: true,
  },
})

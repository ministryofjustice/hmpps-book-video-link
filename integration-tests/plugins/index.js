const auth = require('../mockApis/auth')
const prisonApi = require('../mockApis/prisonApi')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const activityResponse = require('../mockApis/responses/activityResponse')
const {
  courtEventsWithDifferentStatusResponse,
  externalTransfersResponse,
} = require('../mockApis/responses/houseBlockResponse')
const alertsResponse = require('../mockApis/responses/alertsResponse')

const { resetStubs } = require('../mockApis/wiremock')

const extractOffenderNumbers = activityList => {
  const result = Object.keys(activityList).reduce((r, k) => {
    return r.concat(activityList[k])
  }, [])
  return [...new Set(result.map(item => item.offenderNo))]
}

module.exports = on => {
  on('task', {
    reset: resetStubs,
    resetAndStubTokenVerification: async () => {
      await resetStubs()
      return tokenverification.stubVerifyToken(true)
    },
    stubAuthHealth: status => Promise.all([auth.stubHealth(status)]),
    stubPrisonApiHealth: status => Promise.all([prisonApi.stubHealth(status)]),
    stubWhereaboutsHealth: status => Promise.all([whereabouts.stubHealth(status)]),
    stubTokenverificationHealth: status => Promise.all([tokenverification.stubHealth(status)]),

    stubHealthAllHealthy: () =>
      Promise.all([
        auth.stubHealth(),
        prisonApi.stubHealth(),
        whereabouts.stubHealth(),
        tokenverification.stubHealth(),
      ]),
    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username = 'ITAG_USER', caseload = 'MDI', roles = [] }) =>
      Promise.all([
        auth.stubLogin(username, caseload, roles),
        prisonApi.stubUserMe(),
        prisonApi.stubUserCaseloads(),
        tokenverification.stubVerifyToken(true),
      ]),
    stubLoginCourt: () =>
      Promise.all([auth.stubLoginCourt(), prisonApi.stubUserCaseloads(), tokenverification.stubVerifyToken(true)]),

    stubUserEmail: username => Promise.all([auth.stubEmail(username)]),
    stubUser: (username, caseload) => Promise.all([auth.stubUser(username, caseload)]),
    stubStaff: ({ staffId, details }) => Promise.all([prisonApi.stubStaff(staffId, details)]),
    stubScheduledActivities: response => Promise.all([prisonApi.stubUserScheduledActivities(response)]),
    stubProgEventsAtLocation: ({ caseload, locationId, timeSlot, date, activities }) =>
      Promise.all([prisonApi.stubProgEventsAtLocation(caseload, locationId, timeSlot, date, activities)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
    stubCourts: courts => Promise.all([whereabouts.stubCourtLocations(courts)]),
    stubGroups: caseload => whereabouts.stubGroups(caseload),
    stubAddVideoLinkAppointment: appointment => Promise.all([whereabouts.stubAddVideoLinkAppointment(appointment)]),

    stubForAttendance: ({ caseload, locationId, timeSlot, date, activities }) => {
      const offenderNumbers = extractOffenderNumbers(activities)
      return Promise.all([
        prisonApi.stubUserCaseloads(),
        prisonApi.stubProgEventsAtLocation(locationId, timeSlot, date, activities),
        prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        prisonApi.stubVisits(activityResponse.visits),
        prisonApi.stubActivityLocations(),
        prisonApi.stubAppointments(),
        prisonApi.stubActivities(),
        prisonApi.stubCourtEvents(),
        prisonApi.stubExternalTransfers(),
        prisonApi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        prisonApi.stubAssessments(offenderNumbers),
        prisonApi.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubGetActivityList: ({ caseload, locationId, timeSlot, date, inThePast = false, activities }) => {
      let activity
      if (activities) {
        activity = activities
      } else {
        activity = inThePast ? activityResponse.pastActivities : activityResponse.activities
      }
      const offenderNumbers = extractOffenderNumbers(activity)
      return Promise.all([
        prisonApi.stubUserCaseloads(),
        prisonApi.stubProgEventsAtLocation(locationId, timeSlot, date, activity),
        prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        prisonApi.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        prisonApi.stubVisits(activityResponse.visits),
        prisonApi.stubActivityLocations(),
        prisonApi.stubAppointments(activityResponse.appointments),
        prisonApi.stubActivities(activityResponse.activities),
        prisonApi.stubCourtEvents(courtEventsWithDifferentStatusResponse),
        prisonApi.stubExternalTransfers(externalTransfersResponse),
        prisonApi.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        prisonApi.stubAssessments(offenderNumbers),
        prisonApi.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubAlertTypes: () => Promise.all([prisonApi.stubAlertTypes()]),
    stubAlertsForBooking: alerts => Promise.all([prisonApi.stubAlertsForBooking(alerts)]),
    stubAlerts: prisonApi.stubAlerts,

    stubInmates: prisonApi.stubInmates,
    stubUserLocations: prisonApi.stubUserLocations,

    stubReleaseDatesOffenderNo: releaseDates => Promise.all([prisonApi.stubPrisonerSentenceDetails(releaseDates)]),
    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubGetAbsenceReasons: response => Promise.all([whereabouts.stubGetAbsenceReasons()]),
    stubGetAttendance: ({ caseload, locationId, timeSlot, date, data }) =>
      Promise.all([whereabouts.stubGetAttendance(caseload, locationId, timeSlot, date, data)]),
    stubPostAttendance: response => whereabouts.stubPostAttendance(response),
    stubPutAttendance: response => whereabouts.stubPutAttendance(response),
    verifyPostAttendance: () => whereabouts.verifyPostAttendance(),
    stubSentenceAdjustments: response => prisonApi.stubGetSentenceAdjustments(response),
    stubMovementsBetween: prisonApi.stubMovementsBetween,
    stubOffenderBasicDetails: basicDetails => Promise.all([prisonApi.stubOffenderBasicDetails(basicDetails)]),
    stubOffenderFullDetails: fullDetails => Promise.all([prisonApi.stubOffenderFullDetails(fullDetails)]),
    stubAppointmentTypes: types => Promise.all([prisonApi.stubAppointmentTypes(types)]),
    stubAppointmentsAtAgency: (agency, locations) =>
      Promise.all([prisonApi.stubUsageAtAgency(agency, 'APP', locations)]),
    stubVisitsAtAgency: (agency, locations) => Promise.all([prisonApi.stubUsageAtAgency(agency, 'VISIT', locations)]),
    stubActivityLocations: status => prisonApi.stubActivityLocations(status),
    stubPostAppointments: () => Promise.all([prisonApi.stubPostAppointments()]),
    stubSchedules: ({ agency, location, date, appointments, visits, activities }) =>
      Promise.all([
        prisonApi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments),
        prisonApi.stubSchedulesAtLocation(location, 'APP', date, appointments),
        prisonApi.stubSchedulesAtAgency(agency, location, 'VISIT', date, visits),
        prisonApi.stubSchedulesAtLocation(location, 'VISIT', date, visits),
        prisonApi.stubCourtEvents(),
        prisonApi.stubActivitySchedules(location, date, activities),
        prisonApi.stubVisits(visits),
        prisonApi.stubExternalTransfers(),
        prisonApi.stubAppointments(appointments),
        prisonApi.stubActivities(activities),
      ]),
    stubSentenceData: details => prisonApi.stubSentenceData(details),
    stubLocation: ({ locationId, locationData }) => Promise.all([prisonApi.stubLocation(locationId, locationData)]),
    stubAgencyDetails: ({ agencyId, details }) => Promise.all([prisonApi.stubAgencyDetails(agencyId, details)]),
    stubAppointmentLocations: ({ agency, locations }) =>
      Promise.all([prisonApi.stubAppointmentLocations(agency, locations)]),
    stubBookingOffenders: offenders => Promise.all([prisonApi.stubBookingOffenders(offenders)]),
    stubAgencies: agencies => Promise.all([prisonApi.stubAgencies(agencies)]),
    stubAppointmentsAtAgencyLocation: ({ agency, location, date, appointments }) =>
      Promise.all([prisonApi.stubSchedulesAtAgency(agency, location, 'APP', date, appointments)]),
    stubCourtCases: courtCases => prisonApi.stubCourtCases(courtCases),
    stubOffenceHistory: offenceHistory => prisonApi.stubOffenceHistory(offenceHistory),
    stubSentenceTerms: sentenceTerms => prisonApi.stubSentenceTerms(sentenceTerms),
    stubClientCredentialsRequest: () => auth.stubClientCredentialsRequest(),
    stubUserMeRoles: roles => auth.stubUserMeRoles(roles),
    stubUserMe: () => auth.stubUserMe(),
    stubVisitsWithVisitors: ({ visitsWithVisitors, offenderBasicDetails, visitTypes }) =>
      Promise.all([
        prisonApi.stubVisitsWithVisitors(visitsWithVisitors),
        prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonApi.stubVisitTypes(visitTypes),
      ]),
    stubSchedule: ({ offenderBasicDetails, thisWeeksSchedule, nextWeeksSchedule }) =>
      Promise.all([
        prisonApi.stubOffenderBasicDetails(offenderBasicDetails),
        prisonApi.stubScheduledEventsForThisWeek(thisWeeksSchedule),
        prisonApi.stubScheduledEventsForNextWeek(nextWeeksSchedule),
      ]),
    stubAppointmentsGet: prisonApi.stubAppointmentsGet,
    stubVideoLinkAppointments: whereabouts.stubVideoLinkAppointments,
    stubCreateAlert: prisonApi.stubCreateAlert,
    stubPrisonApiGlobalSearch: prisonApi.stubPrisonApiGlobalSearch,
    stubOffenderImage: prisonApi.stubOffenderImage,
    stubOffenderMovements: prisonApi.stubOffenderMovements,
    stubBookingDetails: details => prisonApi.stubBookingDetails(details),
    stubBookingNonAssociations: response => prisonApi.stubBookingNonAssociations(response),
    stubUserCaseLoads: caseloads => prisonApi.stubUserCaseloads(caseloads),
    stubUpdateCaseload: prisonApi.stubUpdateCaseload,
    stubCellAttributes: prisonApi.stubCellAttributes,
    stubMainOffence: offence => prisonApi.stubMainOffence(offence),
    stubCsraAssessments: ({ offenderNumbers, assessments }) =>
      prisonApi.stubCsraAssessments(offenderNumbers, assessments),
    stubCellsWithCapacity: ({ cells }) => prisonApi.stubCellsWithCapacity(cells),
    stubCellsWithCapacityByGroupName: ({ agencyId, groupName, response }) =>
      whereabouts.stubCellsWithCapacityByGroupName({ agencyId, groupName, response }),
    stubInmatesAtLocation: ({ inmates }) => prisonApi.stubInmatesAtLocation(inmates),
    stubOffenderCellHistory: ({ history }) => prisonApi.stubOffenderCellHistory(history),
    stubGetAlerts: ({ agencyId, alerts }) => prisonApi.stubGetAlerts({ agencyId, alerts }),
    stubGetAlert: ({ bookingId, alertId, alert }) => prisonApi.stubGetAlert({ bookingId, alertId, alert }),
    stubPutAlert: ({ bookingId, alertId, alert }) => prisonApi.stubPutAlert({ bookingId, alertId, alert }),
    stubHistoryForLocation: locationHistory => prisonApi.stubHistoryForLocation(locationHistory),
    stubAttributesForLocation: locationAttributes => prisonApi.stubAttributesForLocation(locationAttributes),
    stubPrisonerDetail: ({ prisonerDetail, bookingId }) => prisonApi.stubPrisonerDetail(prisonerDetail, bookingId),
    stubPrisonerFullDetail: ({ prisonerDetail, offenderNo, fullInfo }) =>
      prisonApi.stubPrisonerFullDetail(prisonerDetail, offenderNo, fullInfo),
    stubMoveToCell: () => prisonApi.stubMoveToCell(),
    stubMoveToCellSwap: () => prisonApi.stubMoveToCellSwap(),
    verifyMoveToCell: ({ bookingId, locationPrefix }) => prisonApi.verifyMoveToCell({ bookingId, locationPrefix }),
    stubGetLocationPrefix: ({ agencyId, groupName, response }) =>
      whereabouts.stubGetLocationPrefix({ agencyId, groupName, response }),
    verifyMoveToCellSwap: ({ bookingId }) => prisonApi.verifyMoveToCellSwap({ bookingId }),
    stubAttendanceStats: ({ agencyId, fromDate, period, stats }) =>
      whereabouts.stubAttendanceStats(agencyId, fromDate, period, stats),
    stubEstablishmentRollCount: ({ agencyId, assignedMovements, unassignedMovements, movements, enroute }) =>
      Promise.all([
        prisonApi.stubAssignedMovements(agencyId, assignedMovements),
        prisonApi.stubUnassignedMovements(agencyId, unassignedMovements),
        prisonApi.stubRollcountByType(agencyId, 'movements', movements),
        prisonApi.stubRollcountByType(agencyId, 'enroute', enroute),
      ]),
    stubCourtEvents: courtEvents => prisonApi.stubCourtEvents(courtEvents),
    stubGetEventsByLocationIds: ({ agencyId, date, timeSlot, response }) =>
      prisonApi.stubGetEventsByLocationIds(agencyId, date, timeSlot, response),
    stubExternalTransfers: response => prisonApi.stubExternalTransfers(response),
    stubAssessments: offenderNumbers => prisonApi.stubAssessments(offenderNumbers),
    stubGetAgencyGroupLocations: ({ agencyId, groupName, response }) =>
      whereabouts.stubGetAgencyGroupLocations({ agencyId, groupName, response }),
    stubLocationGroups: locationGroups => whereabouts.stubLocationGroups(locationGroups),
    stubActivityLocationsByDateAndPeriod: ({ locations, date, period, withFault }) =>
      prisonApi.stubActivityLocationsByDateAndPeriod(locations, date, period, withFault),
    stubActivityLocationsConnectionResetFault: () => prisonApi.stubActivityLocationsConnectionResetFault(),
    stubGetAttendancesForBookings: ({ agencyId, timeSlot, date, data }) =>
      whereabouts.stubGetAttendancesForBookings(agencyId, timeSlot, date, data),
    stubGetAdjudicationDetails: adjudicationDetails => prisonApi.stubGetAdjudicationDetails(adjudicationDetails),
    stubAdjudicationFindingTypes: types => prisonApi.stubAdjudicationFindingTypes(types),
    stubAdjudications: ({ response, headers }) => prisonApi.stubAdjudications(response, headers),
    verifyAdjudicationsHistory: ({ offenderNo, agencyId, finding, fromDate, toDate }) =>
      prisonApi.verifyAdjudicationsHistory({ offenderNo, agencyId, finding, fromDate, toDate }),
    resetAdjudicationsStub: () => prisonApi.resetAdjudicationsStub(),
    stubIepSummaryForBooking: iepSummary => prisonApi.stubIepSummaryForBooking(iepSummary),
    stubMovementsIn: ({ agencyId, fromDate, movements }) =>
      prisonApi.stubMovementsIn({ agencyId, fromDate, movements }),
    stubMovementsOut: ({ agencyId, fromDate, movements }) =>
      prisonApi.stubMovementsOut({ agencyId, fromDate, movements }),
    stubIepSummaryForBookingIds: prisonApi.stubIepSummaryForBookingIds,
    stubSystemAlerts: prisonApi.stubSystemAlerts,
    stubInReception: ({ agencyId, results }) => prisonApi.stubRollcountByType(agencyId, 'in-reception', results),
    stubEnRoute: ({ agencyId, results }) => prisonApi.stubEnRoute(agencyId, results),
    stubCurrentlyOut: ({ livingUnitId, movements }) => prisonApi.stubCurrentlyOut(livingUnitId, movements),
    stubTotalCurrentlyOut: ({ agencyId, movements }) => prisonApi.stubTotalCurrentlyOut(agencyId, movements),
    stubGetAgencyIepLevels: response => prisonApi.stubGetAgencyIepLevels(response),
    stubChangeIepLevel: body => prisonApi.stubChangeIepLevel(body),
  })
}

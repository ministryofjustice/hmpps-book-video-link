const page = require('../page')

const confirmBookingPage = () =>
  page('Check and confirm your booking', {
    form: () => ({
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    court: () => cy.get('.qa-court-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    preTime: () => cy.get('.qa-PreCourtHearingBriefing-value'),
    postTime: () => cy.get('.qa-PostCourtHearingBriefing-value'),
    mainRoom: () => cy.get('.qa-prisonRoomForCourtHearing-value'),
    preRoom: () => cy.get('.qa-PrisonRoomForPreCourtHearingBriefing-value'),
    postRoom: () => cy.get('.qa-PrisonRoomForPostCourtHearingBriefing-value'),
  })

export default {
  verifyOnPage: confirmBookingPage,
  url: (caseload, offenderNo) => `/${caseload}/offenders/${offenderNo}/add-court-appointment/confirm-booking`,
  goTo: (caseload, offenderNo) => {
    cy.visit(this.url(caseload, offenderNo))
    return confirmBookingPage()
  },
}

const page = require('../page')

const confirmationPage = () =>
  page(`The video link has been booked`, {
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    room: () => cy.get('.qa-prisonRoom-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    comments: () => cy.get('.qa-comments-value'),
    legalBriefingBefore: () => cy.get('.qa-preCourtHearingBriefing-value'),
    legalBriefingAfter: () => cy.get('.qa-postCourtHearingBriefing-value'),
    courtLocation: () => cy.get('.qa-courtLocation-value'),
    exitToAllBookings: () => cy.get('[data-qa="exit-to-all-bookings"]'),
  })

export default {
  verifyOnPage: confirmationPage,
}

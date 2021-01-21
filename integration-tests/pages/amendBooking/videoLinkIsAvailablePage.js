const page = require('../page')

const videoLinkIsAvailablePage = () =>
  page('The video link date and time is available', {
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    courtLocation: () => cy.get('.qa-court-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    legalBriefingBefore: () => cy.get('.qa-preCourtHearingBriefing-value'),
    legalBriefingAfter: () => cy.get('.qa-postCourtHearingBriefing-value'),
    continue: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: videoLinkIsAvailablePage,
  goTo: (id, prisonerName) => {
    cy.visit(`/video-link-available/${id}`)
    return videoLinkIsAvailablePage(prisonerName)
  },
}

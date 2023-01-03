const page = require('../page')

const confirmUpdatedBookingPage = () =>
  page('Check and confirm your booking', {
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    courtLocation: () => cy.get('.qa-courtLocation-value'),
    date: () => cy.get('.qa-date-value'),
    mainTimes: () => cy.get('.mainCourtHearingTime'),
    mainRoom: () => cy.get('.prisonRoomForCourtHearing'),
    legalBriefingBeforeTimes: () => cy.get('.qa-preCourtHearingBriefing-value'),
    legalBriefingBeforeRoom: () => cy.get('.qa-prisonRoomForPreCourtHearingBriefing-value'),
    legalBriefingAfterTimes: () => cy.get('.qa-postCourtHearingBriefing-value'),
    legalBriefingAfterRoom: () => cy.get('.qa-prisonRoomForPostCourtHearingBriefing-value'),
    form: {
      inlineError: () => cy.get('.govuk-error-message'),
      comment: () => cy.get('#comment'),
    },
    errorSummaryTitle: () => cy.get('.govuk-error-summary__title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
    updateVideoLink: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: confirmUpdatedBookingPage,
}

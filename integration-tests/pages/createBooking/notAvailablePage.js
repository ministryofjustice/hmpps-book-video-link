const page = require('../page')

const noAvailabilityPage = () =>
  page('Video link booking not available', {
    info: () => cy.get('.govuk-body p').first(),
    selectAlternative: i => cy.get(`[data-qa=option-${i}]`).click(),
    details: () => cy.get('.govuk-details'),
    detailsSummaryText: () => cy.get('.govuk-details__summary-text'),
    detailsTextFirst: () => cy.get('.govuk-details__text p:nth-child(1)'),
    detailsTextSecond: () => cy.get('.govuk-details__text p:nth-child(2)'),
  })

export default {
  verifyOnPage: noAvailabilityPage,
}

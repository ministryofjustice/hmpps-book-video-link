const page = require('../page')

const noAvailabilityPage = () =>
  page('Video link booking not available', {
    info: () => cy.get('.govuk-body p').first(),
    selectAlternative: i => cy.get(`[data-qa=option-${i}]`).click(),
  })

export default {
  verifyOnPage: noAvailabilityPage,
}

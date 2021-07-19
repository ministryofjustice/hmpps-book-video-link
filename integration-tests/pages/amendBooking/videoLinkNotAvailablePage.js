const page = require('../page')

const videoLinkNotAvailablePage = () =>
  page('Video link booking not available', {
    info: () => cy.get('.govuk-body p').first(),
    selectAlternative: i => cy.get(`[data-qa=option-${i}]`).click(),
    searchAgainButton: () => cy.get('.govuk-button').first(),
  })

export default {
  verifyOnPage: videoLinkNotAvailablePage,
}

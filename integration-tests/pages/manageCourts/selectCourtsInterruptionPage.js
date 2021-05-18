const page = require('../page')

const selectCourtsInterruptionPage = () =>
  page('Select the courts you book video links for', {
    continue: () => cy.get('.govuk-button'),
  })

export default {
  verifyOnPage: selectCourtsInterruptionPage,
}

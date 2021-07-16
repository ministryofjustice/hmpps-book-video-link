const page = require('../page')

const noLongerAvailablePage = () =>
  page('The room in the prison is no longer available', {
    continue: () => cy.get('.govuk-button'),
  })

export default {
  verifyOnPage: noLongerAvailablePage,
}

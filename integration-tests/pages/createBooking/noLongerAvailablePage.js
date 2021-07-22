const page = require('../page')

const noLongerAvailablePage = () =>
  page('Rooms you have selected are no longer available', {
    continue: () => cy.get('.govuk-button'),
  })

export default {
  verifyOnPage: noLongerAvailablePage,
}

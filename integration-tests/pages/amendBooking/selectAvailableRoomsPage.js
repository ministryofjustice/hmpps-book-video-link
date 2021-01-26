const page = require('../page')

const selectAvailableRoomsPage = () =>
  page('Select an available room in the prison', {
    form: () => ({
      inlineError: () => cy.get('.govuk-error-message'),
      preLocation: () => cy.get('#preLocation'),
      mainLocation: () => cy.get('#mainLocation'),
      postLocation: () => cy.get('#postLocation'),
      comments: () => cy.get('#comment'),
    }),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
    bookVideoLink: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: selectAvailableRoomsPage,
}

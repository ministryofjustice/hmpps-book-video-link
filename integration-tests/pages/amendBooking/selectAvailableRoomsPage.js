const page = require('../page')

const selectAvailableRoomsPage = () =>
  page('Select an available room in the prison', {
    form: () => ({
      inlineError: () => cy.get('.govuk-error-message'),
      selectPreAppointmentLocation: () => cy.get('#selectPreAppointmentLocation'),
      selectMainAppointmentLocation: () => cy.get('#selectMainAppointmentLocation'),
      selectPostAppointmentLocation: () => cy.get('#selectPostAppointmentLocation'),
      comments: () => cy.get('#comment'),
    }),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
    bookVideoLink: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: selectAvailableRoomsPage,
}

const page = require('../page')

const hearingPage = () =>
  page('Booking events download', {
    form: () => ({
      heading: () => cy.get('.govuk-heading-m'),
      startDay: () => cy.get('#startDay'),
      startMonth: () => cy.get('#startMonth'),
      startYear: () => cy.get('#startYear'),
      days: () => cy.get('#days'),
    }),
    downloadButton: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: hearingPage,
  goTo: () => {
    cy.visit('/download-by-hearing')
    return hearingPage()
  },
}

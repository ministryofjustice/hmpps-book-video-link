const page = require('../page')

const manageCourtsPage = () =>
  page('Manage your list of courts', {
    form: {
      section: section => cy.get(`#accordion-default-heading-${section}`),
      court: agencyId => cy.get(`label[for="court-${agencyId}"]`),
    },
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
    continue: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: manageCourtsPage,
  goTo: () => {
    cy.visit('/manage-courts/')
    return manageCourtsPage()
  },
}

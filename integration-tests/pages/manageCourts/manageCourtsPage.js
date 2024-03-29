const page = require('../page')

const manageCourtsPage = () =>
  page('Manage your list of courts', {
    form: {
      section: section => cy.get(`#accordion-default-heading-${section}`),
      court: courtId => cy.get(`label[for="court-${courtId}"]`),
      checkbox: courtId => cy.get(`input#court-${courtId}`),
    },
    errorSummaryTitle: () => cy.get('.govuk-error-summary__title'),
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

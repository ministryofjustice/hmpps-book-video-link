const page = require('../page')

const changeCommentsPage = ({ commentExists }) =>
  page(commentExists ? 'Change comments on this booking' : 'Add comments on this booking', {
    form: () => ({
      inlineError: () => cy.get('.govuk-error-message'),
      comments: () => cy.get('#comment'),
    }),
    errorSummaryTitle: () => cy.get('.govuk-error-summary__title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
    continue: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: changeCommentsPage,
}

const page = require('../page')

const confirmDeletion = () =>
  page('Are you sure you want to delete this video link booking?', {
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    inlineError: () => cy.get('#delete-booking-error'),
    selectYes: () => cy.get('[name="confirmDeletion"]').check('yes'),
    selectNo: () => cy.get('[name="confirmDeletion"]').check('no'),
    confirmButton: () => cy.get('[data-qa="confirm"]'),
  })

export default {
  verifyOnPage: confirmDeletion,
  goTo: videoLinkBookingId => {
    cy.visit(`/delete-booking/${videoLinkBookingId}`)
    return confirmDeletion()
  },
}

const page = require('../page')

const confirmDeleteBooking = () =>
  page('Are you sure you want to delete this video link booking?', {
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    inlineError: () => cy.get('#confirm-delete-error'),
    selectYes: () => cy.get('[name="confirmDelete"]').check('yes'),
    selectNo: () => cy.get('[name="confirmDelete"]').check('no'),
    confirmButton: () => cy.get('[data-qa="confirm"]'),
  })

export default {
  verifyOnPage: confirmDeleteBooking,
  goTo: videoLinkBookingId => {
    cy.visit(`/delete-booking/${videoLinkBookingId}`)
    return confirmDeleteBooking()
  },
}

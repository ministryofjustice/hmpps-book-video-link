const page = require('../page')

const bookingDetailsPage = prisonerName =>
  page(`${prisonerName} video link details`, {
    changeComment: () => cy.get('[data-qa="change-comments"]'),
    changeBooking: () => cy.get('[data-qa="change-booking"]'),
    deleteButton: () => cy.get('[data-qa="delete-button"]'),
  })

export default {
  verifyOnPage: bookingDetailsPage,
  goTo: (id, prisonerName) => {
    cy.visit(`/booking-details/${id}`)
    return bookingDetailsPage(prisonerName)
  },
}

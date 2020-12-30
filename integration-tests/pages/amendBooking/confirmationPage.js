const page = require('../page')

const confirmationPage = () =>
  page(`The video link has been booked`, {
    exitToAllBookings: () => cy.get('[data-qa="exit-to-all-bookings"]'),
  })

export default {
  verifyOnPage: confirmationPage,
}

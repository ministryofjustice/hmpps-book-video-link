const page = require('../page')

const bookingPage = () =>
  page('Booking events download', {
    form: () => ({
      startDay: () => cy.get('#startDay'),
      startMonth: () => cy.get('#startMonth'),
      startYear: () => cy.get('#startYear'),
      days: () => cy.get('#days'),
    }),
    downloadButton: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: bookingPage,
  goTo: () => {
    cy.visit('/download-by-booking')
    return bookingPage()
  },
}

const page = require('./page')

const eventsPage = () =>
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
  verifyOnPage: eventsPage,
  goTo: () => {
    cy.visit('/video-link-booking-events')
    return eventsPage()
  },
}

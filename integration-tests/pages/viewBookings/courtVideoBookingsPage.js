const page = require('../page')

const row = i => cy.get(`[data-qa='court-bookings-table'] tbody tr`).eq(i)
const col = (i, j) => row(i).find('td').eq(j)

const courtVideoBookingsPage = () =>
  page('Video link bookings for', {
    searchResultsTableRows: () => cy.get("[data-qa='court-bookings-table'] tr"),
    noResultsMessage: () => cy.get("[data-qa='no-results-message']"),
    dateInput: () => cy.get('#date'),
    courtOption: () => cy.get('#courtOption'),
    submitButton: () => cy.get('button[type="submit"]'),
    getRows: () => cy.get(`[data-qa='court-bookings-table'] tbody tr`),
    getRow: i => ({
      time: () => col(i, 0),
      prisoner: () => col(i, 1),
      location: () => col(i, 2),
      court: () => col(i, 3),
      type: () => col(i, 4),
      action: () => col(i, 5).find('a'),
      videoBookingId: () =>
        col(i, 5)
          .find('a')
          .invoke('attr', 'href')
          .then(link => link.match(/\/(.*?)\/your-statement/)[1]),
    }),
  })

export default {
  verifyOnPage: courtVideoBookingsPage,
  goTo: () => {
    cy.visit('/bookings')
    return courtVideoBookingsPage()
  },
}

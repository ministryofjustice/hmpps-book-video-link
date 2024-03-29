const page = require('./page')

const courtVideoLinkHomePage = () =>
  page('Book a video link with a prison', {
    bookingTitle: () => cy.get('[data-qa="bookings-link"]'),
    appointmentsListTitle: () => cy.get('[data-qa="appointments-link"]'),
    manageCourtsListTitle: () => cy.get('[data-qa="manage-courts-link"]'),
    courtServiceFooter: () => cy.get('.qa-court-service-footer'),
    getHelpLink: () => cy.get('[data-qa="get-help"]'),
    loggedInName: () => cy.get('[data-qa="logged-in-name"]'),
  })

export default {
  verifyOnPage: courtVideoLinkHomePage,
  goTo: () => {
    cy.visit('/')
    return courtVideoLinkHomePage()
  },
}

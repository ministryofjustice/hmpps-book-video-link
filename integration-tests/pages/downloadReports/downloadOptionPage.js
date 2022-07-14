const page = require('../page')

const downloadOption = () =>
  page('Booking events download', {
    form: () => ({
      dateBooking: () => cy.get('#option'),
      dateHearing: () => cy.get('#option-2'),
    }),
    continueButton: () => cy.get('.govuk-button'),
  })

export default {
  verifyOnPage: downloadOption,
  goTo: () => {
    cy.visit('/video-link-booking-events')
    return downloadOption()
  },
}

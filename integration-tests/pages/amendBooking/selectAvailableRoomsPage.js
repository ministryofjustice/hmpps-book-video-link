const page = require('../page')

const selectAvailableRoomsPage = () =>
  page('Select an available room in the prison', {
    form: () => ({
      selectPreAppointmentLocation: () => cy.get('#selectPreAppointmentLocation'),
      selectMainAppointmentLocation: () => cy.get('#selectMainAppointmentLocation'),
      selectPostAppointmentLocation: () => cy.get('#selectPostAppointmentLocation'),
      comments: () => cy.get('#comment'),
    }),
    bookVideoLink: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: selectAvailableRoomsPage,
}

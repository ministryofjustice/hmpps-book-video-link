const page = require('../page')

const selectRoomsPage = () =>
  page('Select an available room in the prison', {
    form: () => ({
      selectPreAppointmentLocation: () => cy.get('#preLocation'),
      selectMainAppointmentLocation: () => cy.get('#mainLocation'),
      selectPostAppointmentLocation: () => cy.get('#postLocation'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: selectRoomsPage,
  goTo: (caseload, offenderNo) => {
    cy.visit(`/${caseload}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
    return selectRoomsPage()
  },
}

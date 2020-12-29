const page = require('../page')

const selectRoomsPage = () =>
  page('Select an available room in the prison', {
    form: () => ({
      selectPreAppointmentLocation: () => cy.get('#selectPreAppointmentLocation'),
      selectMainAppointmentLocation: () => cy.get('#selectMainAppointmentLocation'),
      selectPostAppointmentLocation: () => cy.get('#selectPostAppointmentLocation'),
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

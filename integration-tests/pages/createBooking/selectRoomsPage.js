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
  url: (caseload, offenderNo) => `/${caseload}/offenders/${offenderNo}/add-court-appointment/select-rooms`,
  goTo: (caseload, offenderNo) => {
    cy.visit(this.url(caseload, offenderNo))
    return selectRoomsPage()
  },
}

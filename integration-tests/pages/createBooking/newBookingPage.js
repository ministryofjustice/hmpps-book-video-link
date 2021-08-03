const page = require('../page')

const startPage = () =>
  page('Search for a video link booking', {
    form: () => ({
      location: () => cy.get('#location'),
      date: () => cy.get('#date'),
      court: () => cy.get('.qa-court-value'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      preAppointmentRequiredYes: () => cy.get('#pre-appointment-required'),
      preAppointmentRequiredNo: () => cy.get('#pre-appointment-required-2'),
      postAppointmentRequiredYes: () => cy.get('#post-appointment-required'),
      postAppointmentRequiredNo: () => cy.get('#post-appointment-required-2'),
      selectPreAppointmentLocation: () => cy.get('#preLocation'),
      selectMainAppointmentLocation: () => cy.get('#mainLocation'),
      selectPostAppointmentLocation: () => cy.get('#postLocation'),
      comments: () => cy.get('#comments'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    returnToPrisonerSearch: () => cy.get("[data-qa='return-to-prisoner-search']"),
    datePicker: () => cy.get('#ui-datepicker-div'),
    activeDate: () => cy.get('.ui-state-active'),
  })

export default {
  verifyOnPage: startPage,
  goTo: (caseload, offenderNo) => {
    cy.visit(`/${caseload}/offenders/${offenderNo}/add-court-appointment`)
    return startPage()
  },
}

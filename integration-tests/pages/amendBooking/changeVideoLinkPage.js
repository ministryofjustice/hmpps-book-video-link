const page = require('../page')

const changeVideoLinkPage = () =>
  page('Change video link booking', {
    form: {
      inlineError: () => cy.get('.govuk-error-message'),
      court: () => cy.get('.qa-court-value'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      preAppointmentRequiredYes: () => cy.get('#pre-appointment-required'),
      preAppointmentRequiredNo: () => cy.get('#pre-appointment-required-2'),
      postAppointmentRequiredYes: () => cy.get('#post-appointment-required'),
      postAppointmentRequiredNo: () => cy.get('#post-appointment-required-2'),
      preLocation: () => cy.get('#preLocation'),
      mainLocation: () => cy.get('#mainLocation'),
      postLocation: () => cy.get('#postLocation'),
      continue: () => cy.get('button[type="submit"]'),
      cancel: () => cy.get("[data-qa='cancel']"),
    },
    summaryListCourt: () => cy.get('.qa-court-value'),
    datePicker: () => cy.get('#ui-datepicker-div'),
    activeDate: () => cy.get('.ui-state-active'),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
  })

export default {
  verifyOnPage: changeVideoLinkPage,
  goTo: id => {
    cy.visit(`/change-video-link/${id}`)
    return changeVideoLinkPage()
  },
}

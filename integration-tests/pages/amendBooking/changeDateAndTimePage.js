const page = require('../page')

const changeDateAndTimePage = () =>
  page('Change video link date and time', {
    form: {
      inlineError: () => cy.get('.govuk-error-message'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      preAppointmentRequiredYes: () => cy.get('#pre-appointment-required'),
      preAppointmentRequiredNo: () => cy.get('#pre-appointment-required-2'),
      postAppointmentRequiredYes: () => cy.get('#post-appointment-required'),
      postAppointmentRequiredNo: () => cy.get('#post-appointment-required-2'),
      continue: () => cy.get('button[type="submit"]'),
    },
    datePicker: () => cy.get('#ui-datepicker-div'),
    activeDate: () => cy.get('.ui-state-active'),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryBody: () => cy.get('.govuk-error-summary__body'),
  })

export default {
  verifyOnPage: changeDateAndTimePage,
}

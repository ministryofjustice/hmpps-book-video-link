const HomePage = require('../pages/homePage')
const SelectCourtsInterruptionPage = require('../pages/manageCourts/selectCourtsInterruptionPage')
const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')
const CourtSelectionConfirmationPage = require('../pages/manageCourts/courtSelectionConfirmationPage')

context('A user is shown the select courts interrruption page when required', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
  })

  it('A user is redirected to the select courts interruption page when they have no selected preferred courts and is able to update their court preferences', () => {
    cy.task('stubLoginCourt', { preferredCourts: [] })
    cy.login()

    const selectCourtsInterruptionPage = SelectCourtsInterruptionPage.verifyOnPage()
    selectCourtsInterruptionPage.continue().click()
    const manageCourtsPage = ManageCourtsPage.verifyOnPage()
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.checkbox('ABDRCT').should('not.be.checked')
    manageCourtsPage.form.court('ABDRCT').click()
    manageCourtsPage.form.checkbox('ABDRCT').should('be.checked')
    cy.task('stubUpdateUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABDRCT'],
    })
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABDRCT'],
    })
    manageCourtsPage.continue().click()

    const courtSelectionConfirmationPage = CourtSelectionConfirmationPage.verifyOnPage()
    courtSelectionConfirmationPage.courts().should('have.length', 1)
    courtSelectionConfirmationPage.getCourt(1).contains('Aberdare')
    courtSelectionConfirmationPage.continue().click()
    HomePage.verifyOnPage()
  })

  it('A user is not redirected to the select courts interruption page when they have selected preferred courts', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'ABRYCT'] })
    cy.login()

    HomePage.verifyOnPage()
  })
})

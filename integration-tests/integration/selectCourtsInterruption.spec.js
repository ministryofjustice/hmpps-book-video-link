const HomePage = require('../pages/homePage')
const SelectCourtsInterruptionPage = require('../pages/manageCourts/selectCourtsInterruptionPage')
const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')

context('A user is shown the select courts interrruption page when required', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
  })

  it('A user is redirected to the select courts interruption page when they have no selected preferred courts', () => {
    cy.task('stubLoginCourt', { preferredCourts: [] })
    cy.login()

    const selectCourtsInterruptionPage = SelectCourtsInterruptionPage.verifyOnPage()
    selectCourtsInterruptionPage.continue().click()
    const manageCourtsPage = ManageCourtsPage.verifyOnPage()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.court('ABRYCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABDRCT').should('not.be.checked')
    manageCourtsPage.form.court('ABRYCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABRYCT').should('not.be.checked')
  })

  it('A user is not redirected to the select courts interruption page when they have selected preferred courts', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'ABRYCT'] })
    cy.login()

    HomePage.verifyOnPage()
  })
})

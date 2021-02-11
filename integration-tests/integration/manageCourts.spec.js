const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')
const CourtSelectionConfirmationPage = require('../pages/manageCourts/courtSelectionConfirmationPage')

context('A user can view the manage courts page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    cy.task('stubLoginCourt')
    cy.login()
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    cy.task('stubAllCourts', [
      {
        active: true,
        agencyId: 'AAA',
        agencyType: 'CRT',
        description: 'AAA Court',
        longDescription: 'AAA Crown Court',
      },
      {
        active: true,
        agencyId: 'BAC',
        agencyType: 'CRT',
        description: 'BAC Court',
        longDescription: 'BAC Magistrates Court',
      },
      {
        active: true,
        agencyId: 'AAD',
        agencyType: 'CRT',
        description: 'AAD Court',
        longDescription: 'AAD Immigration Court',
      },
      {
        active: true,
        agencyId: 'AAB',
        agencyType: 'CRT',
        description: 'AAB Court',
        longDescription: 'AAB Crown Court',
      },
    ])
  })

  it('The list of courts are displayed', () => {
    const manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('AAA').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('AAA').should('be.visible')
    manageCourtsPage.form.court('AAA').click()
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.continue().click()

    CourtSelectionConfirmationPage.verifyOnPage()
  })

  it('When no court is selected a validation error is displayed', () => {
    let manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('AAA').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('AAA').should('be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.continue().click()
    manageCourtsPage = ManageCourtsPage.verifyOnPage()

    manageCourtsPage.errorSummaryTitle().contains('There is a problem')
    manageCourtsPage.errorSummaryBody().contains('You need to select at least one court')
  })
})

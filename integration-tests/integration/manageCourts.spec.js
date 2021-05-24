const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')
const CourtSelectionConfirmationPage = require('../pages/manageCourts/courtSelectionConfirmationPage')
const HomePage = require('../pages/homePage')

context('A user can view the manage courts page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    cy.task('stubLoginCourt', {})
    cy.login()
  })

  it('When a user selects preferred courts for the first time', () => {
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: [],
    })
    const manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.court('ABRYCT').should('not.be.visible')
    manageCourtsPage.form.court('BANBCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABDRCT').should('not.be.checked')
    manageCourtsPage.form.court('ABRYCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABRYCT').should('not.be.checked')
    manageCourtsPage.form.court('BANBCT').should('not.be.visible')
    manageCourtsPage.form.checkbox('BANBCT').should('not.be.checked')
    manageCourtsPage.form.court('ABRYCT').click()
    manageCourtsPage.form.checkbox('ABRYCT').should('be.checked')
    cy.task('stubUpdateUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABRYCT'],
    })
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABRYCT'],
    })
    manageCourtsPage.continue().click()

    const courtSelectionConfirmationPage = CourtSelectionConfirmationPage.verifyOnPage()
    courtSelectionConfirmationPage.courts().should('have.length', 1)
    courtSelectionConfirmationPage.getCourt(1).contains('Aberystwyth')
    courtSelectionConfirmationPage.continue().click()
    HomePage.verifyOnPage()
  })

  it('When a user updates their list of preferred courts', () => {
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABDRCT', 'ABRYCT'],
    })
    const manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.court('ABRYCT').should('not.be.visible')
    manageCourtsPage.form.court('BANBCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABDRCT').should('be.checked')
    manageCourtsPage.form.court('ABRYCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABRYCT').should('be.checked')
    manageCourtsPage.form.court('BANBCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.section('B').click()
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.court('ABRYCT').should('not.be.visible')
    manageCourtsPage.form.court('BANBCT').should('be.visible')
    manageCourtsPage.form.checkbox('BANBCT').should('not.be.checked')
    manageCourtsPage.form.court('BANBCT').click()
    manageCourtsPage.form.checkbox('BANBCT').should('be.checked')
    cy.task('stubUpdateUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABDRCT', 'ABRYCT', 'BANBCT'],
    })
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: ['ABDRCT', 'ABRYCT', 'BANBCT'],
    })
    manageCourtsPage.continue().click()

    const courtSelectionConfirmationPage = CourtSelectionConfirmationPage.verifyOnPage()
    courtSelectionConfirmationPage.courts().should('have.length', 3)
    courtSelectionConfirmationPage.getCourt(1).contains('Aberdare County')
    courtSelectionConfirmationPage.getCourt(2).contains('Aberystwyth')
    courtSelectionConfirmationPage.getCourt(3).contains('Banbury')
    courtSelectionConfirmationPage.continue().click()
    HomePage.verifyOnPage()
  })

  it('When no court is selected a validation error is displayed', () => {
    cy.task('stubGetUserCourtPreferences', {
      username: 'ITAG_USER',
      courts: [],
    })
    let manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.continue().click()
    manageCourtsPage = ManageCourtsPage.verifyOnPage()

    manageCourtsPage.errorSummaryTitle().contains('There is a problem')
    manageCourtsPage.errorSummaryBody().contains('You need to select at least one court')
  })
})

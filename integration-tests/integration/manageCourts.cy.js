const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')
const CourtSelectionConfirmationPage = require('../pages/manageCourts/courtSelectionConfirmationPage')
const HomePage = require('../pages/homePage')

context('A user can view the manage courts page', () => {
  beforeEach(() => {
    cy.task('reset')

    // Added stub - where else would it get its court list from?
    cy.task('stubCourts')

    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    cy.task('stubLoginCourt', {})
    cy.login()
  })

  it('When a user selects preferred courts for the first time', () => {
    cy.task('stubGetUserCourtPreferences', {
      courts: [],
    })

    const manageCourtsPage = ManageCourtsPage.goTo()

    // Check the expected section headers exist
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')

    // Visibility checks now work on the section content
    cy.get('#accordion-default-content-A').should('not.be.visible')
    cy.get('#accordion-default-content-B').should('not.be.visible')

    // Click section A to make courts beginning with A visible
    manageCourtsPage.form.section('A').click()

    // Recheck visibility
    cy.get(`#accordion-default-content-A`).should('be.visible')
    cy.get(`#accordion-default-content-B`).should('not.be.visible')

    // Section A courts should now be visible but not checked
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABDRCT').should('not.be.checked')
    manageCourtsPage.form.court('ABRYCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABRYCT').should('not.be.checked')

    // Select Aberystwyth in the A section
    manageCourtsPage.form.court('ABRYCT').click()
    manageCourtsPage.form.checkbox('ABRYCT').should('be.checked')

    cy.task('stubUpdateUserCourtPreferences', {
      courts: ['ABRYCT'],
    })

    cy.task('stubGetUserCourtPreferences', {
      courts: ['ABRYCT'],
    })

    manageCourtsPage.continue().click()

    // Confirm Aberystwyth has been selected
    const courtSelectionConfirmationPage = CourtSelectionConfirmationPage.verifyOnPage()
    courtSelectionConfirmationPage.courts().should('have.length', 1)
    courtSelectionConfirmationPage.getCourt(1).contains('Aberystwyth')
    courtSelectionConfirmationPage.continue().click()
    HomePage.verifyOnPage()
  })

  it('When a user updates their list of preferred courts', () => {
    cy.task('stubGetUserCourtPreferences', {
      courts: ['ABDRCT', 'ABRYCT'],
    })

    const manageCourtsPage = ManageCourtsPage.goTo()

    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')

    // Visibility checks now work on the section content
    cy.get('#accordion-default-content-A').should('not.be.visible')
    cy.get('#accordion-default-content-B').should('not.be.visible')

    // Click section A to make courts beginning with A visible
    manageCourtsPage.form.section('A').click()

    // Recheck section visibility
    cy.get(`#accordion-default-content-A`).should('be.visible')
    cy.get(`#accordion-default-content-B`).should('not.be.visible')

    // Check and select A-courts
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABDRCT').should('be.checked')
    manageCourtsPage.form.court('ABRYCT').should('be.visible')
    manageCourtsPage.form.checkbox('ABRYCT').should('be.checked')

    // Click sections A (to close) and B (to open)
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.section('B').click()

    // Recheck section visibility
    cy.get(`#accordion-default-content-A`).should('not.be.visible')
    cy.get(`#accordion-default-content-B`).should('be.visible')

    // Check and select B-courts
    manageCourtsPage.form.court('BANBCT').should('be.visible')
    manageCourtsPage.form.checkbox('BANBCT').should('not.be.checked')
    manageCourtsPage.form.court('BANBCT').click()
    manageCourtsPage.form.checkbox('BANBCT').should('be.checked')

    cy.task('stubUpdateUserCourtPreferences', {
      courts: ['ABDRCT', 'ABRYCT', 'BANBCT'],
    })

    cy.task('stubGetUserCourtPreferences', {
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
      courts: [],
    })

    let manageCourtsPage = ManageCourtsPage.goTo()

    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')

    // Visibility checks now work on the section content
    cy.get('#accordion-default-content-A').should('not.be.visible')
    cy.get('#accordion-default-content-B').should('not.be.visible')

    manageCourtsPage.form.section('A').click()

    // Recheck section visibility
    cy.get('#accordion-default-content-A').should('be.visible')
    cy.get('#accordion-default-content-B').should('not.be.visible')
    manageCourtsPage.form.court('ABDRCT').should('be.visible')

    // Close section A again
    manageCourtsPage.form.section('A').click()
    cy.get('#accordion-default-content-A').should('not.be.visible')

    // Press continue without selecting any courts
    manageCourtsPage.continue().click()
    manageCourtsPage = ManageCourtsPage.verifyOnPage()
    manageCourtsPage.errorSummaryTitle().contains('There is a problem')
    manageCourtsPage.errorSummaryBody().contains('You need to select at least one court')
  })
})

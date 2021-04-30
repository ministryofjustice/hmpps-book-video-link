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
        courtId: 'ABDRCT',
        courtName: 'Aberdare County Court',
        type: {
          courtType: 'COU',
          courtName: 'Aberdare County Court',
        },
        active: true,
      },
      {
        courtId: 'BANBCT',
        courtName: 'Banbury County Court',
        type: {
          courtType: 'COU',
          courtName: 'Banbury County Court',
        },
        active: true,
      },
      {
        courtId: 'ABGVMC',
        courtName: 'Abergavenny Magistrates Court',
        type: {
          courtType: 'MAG',
          courtName: 'Abergavenny Magistrates Court',
        },
        active: true,
      },
      {
        courtId: 'ABRYCT',
        courtName: 'Aberystwyth County Court',
        type: {
          courtType: 'COU',
          courtName: 'Aberystwyth County Court',
        },
        active: true,
      },
    ])
  })

  it('The list of courts are displayed', () => {
    const manageCourtsPage = ManageCourtsPage.goTo()
    manageCourtsPage.form.section('A').should('exist')
    manageCourtsPage.form.section('B').should('exist')
    manageCourtsPage.form.court('ABDRCT').should('not.be.visible')
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.form.court('ABDRCT').should('be.visible')
    manageCourtsPage.form.court('ABDRCT').click()
    manageCourtsPage.form.section('A').click()
    manageCourtsPage.continue().click()

    CourtSelectionConfirmationPage.verifyOnPage()
  })

  it('When no court is selected a validation error is displayed', () => {
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

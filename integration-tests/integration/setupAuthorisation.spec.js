const NoServiceAccessPage = require('../pages/noServiceAccessPage')
const CourtVideoLinkHomePage = require('../pages/videolink/courtVideoLinkHomePage')
const LoginPage = require('../pages/loginPage')

context('A user can book an appointment if has all the required roles', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.task('stubUserMe')
  })

  it('should continue to the Book a video link with a prison page becuase user has ALL the required roles', () => {
    cy.task('stubUserMeRoles', [{ roleCode: 'VIDEO_LINK_COURT_USER' }, { roleCode: 'GLOBAL_SEARCH' }])
    cy.login()
    CourtVideoLinkHomePage.verifyOnPage()
  })

  it('should continue to the Book a video link with a prison page becuase user has MORE than ALL the required roles', () => {
    cy.task('stubUserMeRoles', [
      { roleCode: 'VIDEO_LINK_COURT_USER' },
      { roleCode: 'GLOBAL_SEARCH' },
      { roleCode: 'SOME_OTHER_ROLE' },
    ])
    cy.login()
    CourtVideoLinkHomePage.verifyOnPage()
  })
  it('should redirect to no-service-access page because user has only ONE of the required roles', () => {
    cy.task('stubUserMeRoles', [{ roleCode: 'GLOBAL_SEARCH' }])
    cy.login()
    NoServiceAccessPage.verifyOnPage()
  })

  it('should redirect to no-service-access page because user has NONE of the required roles', () => {
    cy.task('stubUserMeRoles', [])
    cy.login()
    NoServiceAccessPage.verifyOnPage()
  })

  it('should go to the login page when clicking Exit link', () => {
    cy.login()
    cy.visit('/no-service-access')
    const noServiceAccessPage = NoServiceAccessPage.verifyOnPage()
    noServiceAccessPage.exitLink().click()
    LoginPage.verifyOnPage()
  })
})

const HomePage = require('../pages/homePage')

context('A user can view the video link home page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })

  it('should redirect a video court user to the video link home page', () => {
    cy.task('stubLocationGroups')
    cy.task('stubGroups', 'MDI')
    cy.task('stubActivityLocations')

    cy.visit('/')

    HomePage.verifyOnPage()
  })

  it('should redirect a video court user to the video link home page', () => {
    cy.task('stubLocationGroups')
    cy.task('stubActivityLocations')

    cy.visit('/')

    HomePage.verifyOnPage()
  })

  it('A user can view the video link home page', () => {
    const homePage = HomePage.goTo()

    homePage.bookingTitle().contains('Book a new video link')

    homePage.appointmentsListTitle().contains('View and change video links')
  })
})

const moment = require('moment')

const HomePage = require('../pages/homePage')
const PrisonerSearchPage = require('../pages/createBooking/prisonerSearchPage')
const CourtVideoBookingsPage = require('../pages/viewBookings/courtVideoBookingsPage')
const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')

context('A user can view the video link home page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})

    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    cy.task('stubGetVideoLinkBookings', {
      courtId: '.*?',
      agencyId: '.*?',
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })

    cy.task('stubAppointmentLocations', {
      agency: '.*?',
      locations: [],
    })

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
    homePage.manageCourtsListTitle().contains('Manage your list of courts')
  })

  it('A user is taken to the Search for a prisoner page', () => {
    const homePage = HomePage.goTo()
    homePage.bookingTitle().click()
    PrisonerSearchPage.verifyOnPage()
  })
  it('A user is taken to the Video link bookings page', () => {
    const homePage = HomePage.goTo()
    homePage.appointmentsListTitle().click()
    CourtVideoBookingsPage.verifyOnPage()
  })

  it('A user is taken to the Manage Courts page', () => {
    const homePage = HomePage.goTo()
    homePage.manageCourtsListTitle().click()
    ManageCourtsPage.verifyOnPage()
  })
})

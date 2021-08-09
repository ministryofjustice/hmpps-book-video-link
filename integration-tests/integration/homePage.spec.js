const moment = require('moment')

const HomePage = require('../pages/homePage')
const PrisonerSearchPage = require('../pages/createBooking/prisonerSearchPage')
const CourtVideoBookingsPage = require('../pages/viewBookings/courtVideoBookingsPage')
const ManageCourtsPage = require('../pages/manageCourts/manageCourtsPage')
const HelpPage = require('../pages/helpPage')

context('A user can view the video link home page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})

    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    cy.task('stubGetVideoLinkBookings', {
      courtId: '.*?',
      agencyId: '.*?',
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })

    cy.task('stubGetRooms', {
      agencyId: '.*?',
      rooms: [],
    })

    cy.login()
  })

  it('should redirect a video court user to the video link home page', () => {
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

  it('A user is taken to the help page', () => {
    const homePage = HomePage.goTo()
    homePage.getHelpLink().click()
    HelpPage.verifyOnPage()
  })

  it('should display the feedback banner with the correct href', () => {
    const homePage = HomePage.goTo()

    homePage
      .feedbackBannerLink()
      .should('contain', 'Give feedback on this service')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/')
      })
  })
})

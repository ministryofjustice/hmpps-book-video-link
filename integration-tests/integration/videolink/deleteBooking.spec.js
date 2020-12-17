const moment = require('moment')
const CourtVideoLinkBookingsPage = require('../../pages/videolink/courtVideoBookingsPage')
const ConfirmDeleteBookingPage = require('../../pages/videolink/confirmDeleteBookingPage')
const BookingDeleteConfirmed = require('../../pages/videolink/bookingDeleteConfirmedPage')
const CourtVideoLinkHomePage = require('../../pages/videolink/courtVideoLinkHomePage')
const PrisonerSearchPage = require('../../pages/videolink/prisonerSearchPage')

context('A user can delete a booking', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')

    // Stub booking list
    cy.task('stubCourts')
    cy.task('stubOffenderBookings', [
      { bookingId: 1, firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: 2, firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubAppointmentLocations', {
      agency: 'WWI',
      locations: [
        { locationId: 100, userDescription: 'Room 1' },
        { locationId: 110, userDescription: 'Room 2' },
        { locationId: 120, userDescription: 'Room 3' },
      ],
    })

    cy.task('stubGetVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [
        {
          agencyId: 'WWI',
          bookingId: 1,
          comment: 'A comment',
          court: 'Leeds',
          videoLinkBookingId: 10,
          pre: {
            locationId: 100,
            startTime: '2020-01-02T12:40:00',
            endTime: '2020-01-02T13:00:00',
          },
          main: {
            locationId: 110,
            startTime: '2020-01-02T13:00:00',
            endTime: '2020-01-02T13:30:00',
          },
          post: {
            locationId: 120,
            startTime: '2020-01-02T13:30:00',
            endTime: '2020-01-02T13:50:00',
          },
        },
        {
          agencyId: 'WWI',
          bookingId: 2,
          comment: 'A comment',
          court: 'Other court',
          videoLinkBookingId: 11,
          pre: {
            locationId: 100,
            startTime: '2020-01-02T14:40:00',
            endTime: '2020-01-02T15:00:00',
          },
          main: {
            locationId: 110,
            startTime: '2020-01-02T15:00:00',
            endTime: '2020-01-02T15:30:00',
          },
        },
      ],
    })

    // Stub booking details
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Leeds',
      videoLinkBookingId: 10,
      pre: {
        locationId: 100,
        startTime: '2020-01-02T12:40:00',
        endTime: '2020-01-02T13:00:00',
      },
      main: {
        locationId: 110,
        startTime: '2020-01-02T13:00:00',
        endTime: '2020-01-02T13:30:00',
      },
      post: {
        locationId: 120,
        startTime: '2020-01-02T13:30:00',
        endTime: '2020-01-02T13:50:00',
      },
    })

    cy.task('stubOffenderBooking', {
      bookingId: 1,
      response: {
        bookingId: 789,
        firstName: 'john',
        lastName: 'doe',
        offenderNo: 'A1234AA',
      },
    })

    cy.task('stubLocation', {
      locationId: 110,
      response: {
        description: 'vcc room 1',
        locationId: 1,
      },
    })

    cy.task('stubAgencyDetails', {
      agencyId: 'WWI',
      details: { agencyId: 'WWI', description: 'Wandsworth', agencyType: 'INST' },
    })

    cy.task('stubDeleteVideoLinkBooking', 10)

    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    cy.task('stubPrisonApiGlobalSearch', [
      {
        offenderNo: 'A1234AA',
        firstName: 'TEST',
        middleNames: 'ING',
        lastName: 'OFFENDER',
        dateOfBirth: '1980-07-17',
        latestLocationId: 'WWI',
        latestLocation: 'Wandsworth',
        pncNumber: '1/2345',
      },
    ])
  })

  it('A user is required to confirm they wish to delete a booking', () => {
    cy.task('stubLoginCourt')

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const confirmDeleteBookingPage = ConfirmDeleteBookingPage.verifyOnPage()
    confirmDeleteBookingPage.confirmButton().click()
    confirmDeleteBookingPage.errorSummaryTitle().contains('There is a problem')
    confirmDeleteBookingPage.inlineError().contains('Select Yes or No')
  })

  it('A user chooses not to delete a booking', () => {
    cy.task('stubLoginCourt')

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const confirmDeleteBookingPage = ConfirmDeleteBookingPage.verifyOnPage()
    confirmDeleteBookingPage.selectNo()
    confirmDeleteBookingPage.confirmButton().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
  })

  it('A user chooses to delete a booking', () => {
    cy.task('stubLoginCourt')

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const confirmDeleteBookingPage = ConfirmDeleteBookingPage.verifyOnPage()
    confirmDeleteBookingPage.selectYes()
    confirmDeleteBookingPage.confirmButton().click()

    const bookingDeleteConfirmedPage = BookingDeleteConfirmed.verifyOnPage()
    bookingDeleteConfirmedPage.exit().click()

    CourtVideoLinkHomePage.verifyOnPage()
  })

  it('A user chooses to delete a booking then selects to add another', () => {
    cy.task('stubLoginCourt')

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const confirmDeleteBookingPage = ConfirmDeleteBookingPage.verifyOnPage()
    confirmDeleteBookingPage.selectYes()
    confirmDeleteBookingPage.confirmButton().click()

    const bookingDeleteConfirmedPage = BookingDeleteConfirmed.verifyOnPage()

    bookingDeleteConfirmedPage.addAppointment().click()

    const prisonerSearchPage = PrisonerSearchPage.verifyOnPage()
    prisonerSearchPage.prisonNumber().should('have.value', 'A1234AA')
  })
})

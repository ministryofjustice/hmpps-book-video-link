const moment = require('moment')
const CourtVideoLinkBookingsPage = require('../../pages/viewBookings/courtVideoBookingsPage')
const ConfirmDeletionPage = require('../../pages/deleteBooking/confirmDeletionPage')
const VideoLinkDeletedPage = require('../../pages/deleteBooking/videoLinkDeletedPage')
const PrisonerSearchPage = require('../../pages/createBooking/prisonerSearchPage')
const BookingDetailsPage = require('../../pages/viewBookings/bookingDetailsPage')

context('A user can delete a booking', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})
    cy.login()

    cy.task('stubUserEmail', 'COURT_USER')
    cy.task('stubUser', 'COURT_USER', 'WWI')

    // Stub booking list
    cy.task('stubCourts')
    cy.task('stubFindPrisonersByBookingIds', [
      { bookingId: '1', firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: '2', firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })

    cy.task('stubGetRooms', {
      agencyId: '.*?',
      rooms: [],
    })

    cy.task('stubGetRooms', {
      agencyId: 'WWI',
      rooms: [
        { locationId: 100, description: 'Room 1', locationType: 'VIDE' },
        { locationId: 110, description: 'Room 2', locationType: 'VIDE' },
        { locationId: 120, description: 'Room 3', locationType: 'VIDE' },
      ],
    })

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [
        {
          agencyId: 'WWI',
          bookingId: 1,
          comment: 'A comment',
          court: 'Aberdare County Court',
          courtId: 'ABDRCT',
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
          court: 'Aberdare County Court',
          courtId: 'ABDRCT',
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
      court: 'Aberdare County Court',
      courtId: 'ABDRCT',
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
    cy.task('stubLoginCourt', {})

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const bookingDetailsPage = BookingDetailsPage.verifyOnPage('John Doe’s')
    bookingDetailsPage.deleteButton().click()

    const confirmDeletionPage = ConfirmDeletionPage.verifyOnPage()
    confirmDeletionPage.confirmButton().click()
    confirmDeletionPage.errorSummaryTitle().contains('There is a problem')
    confirmDeletionPage.inlineError().contains('Select Yes or No')
  })

  it('A user chooses not to delete a booking', () => {
    cy.task('stubLoginCourt', {})

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const bookingDetailsPage = BookingDetailsPage.verifyOnPage('John Doe’s')
    bookingDetailsPage.deleteButton().click()

    const confirmDeletionPage = ConfirmDeletionPage.verifyOnPage()
    confirmDeletionPage.selectNo()
    confirmDeletionPage.confirmButton().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
  })

  it('A user chooses to delete a booking', () => {
    cy.task('stubLoginCourt', {})

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const bookingDetailsPage = BookingDetailsPage.verifyOnPage('John Doe’s')
    bookingDetailsPage.deleteButton().click()

    const confirmDeletionPage = ConfirmDeletionPage.verifyOnPage()
    confirmDeletionPage.selectYes()
    confirmDeletionPage.confirmButton().click()

    const videoLinkDeletedPage = VideoLinkDeletedPage.verifyOnPage()
    videoLinkDeletedPage.exit().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
  })

  it('A user chooses to delete a booking then selects to add another', () => {
    cy.task('stubLoginCourt', {})

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRow(1).action().click()

    const bookingDetailsPage = BookingDetailsPage.verifyOnPage('John Doe’s')
    bookingDetailsPage.deleteButton().click()

    const confirmDeletionPage = ConfirmDeletionPage.verifyOnPage()
    confirmDeletionPage.selectYes()
    confirmDeletionPage.confirmButton().click()

    const videoLinkDeletedPage = VideoLinkDeletedPage.verifyOnPage()

    videoLinkDeletedPage.addAppointment().click()

    const prisonerSearchPage = PrisonerSearchPage.verifyOnPage()
    prisonerSearchPage.prisonNumber().should('have.value', 'A1234AA')
  })
})

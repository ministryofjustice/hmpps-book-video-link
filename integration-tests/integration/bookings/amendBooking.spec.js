const moment = require('moment')
const BookingDetailsPage = require('../../pages/viewBookings/bookingDetailsPage')
const ChangeDateAndTimePage = require('../../pages/amendBooking/changeDateAndTimePage')
const VideoLinkIsAvailablePage = require('../../pages/amendBooking/videoLinkIsAvailablePage')
const SelectAvailableRoomsPage = require('../../pages/amendBooking/selectAvailableRoomsPage')
const ConfirmationPage = require('../../pages/amendBooking/confirmationPage')
const CourtVideoLinkBookingsPage = require('../../pages/viewBookings/courtVideoBookingsPage')

context('A user can amend a booking', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    // Stub booking list
    cy.task('stubCourts')
    cy.task('stubOffenderBookings', [
      { bookingId: 1, firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: 2, firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubGetVideoLinkBookings', {
      agencyId: '.*?',
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })

    cy.task('stubAppointmentLocations', {
      agency: '.*?',
      locations: [],
    })

    cy.task('stubAppointmentLocations', {
      agency: 'WWI',
      locations: [
        { locationId: 100, userDescription: 'Room 1', locationType: 'VIDE' },
        { locationId: 110, userDescription: 'Room 2', locationType: 'VIDE' },
        { locationId: 120, userDescription: 'Room 3', locationType: 'VIDE' },
      ],
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'WWI',
      location: '.*?',
      date: '.*?',
      appointments: [],
    })

    cy.task('stubGetVideoLinkBookings', {
      agencyId: 'WWI',
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

  it('A user successfully amends a booking', () => {
    cy.task('stubLoginCourt')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()

    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.continue().click()

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.offenderName().contains('John Doe')
    videoLinkIsAvailablePage.prison().contains('Wandsworth')
    videoLinkIsAvailablePage.courtLocation().contains('Leeds')
    videoLinkIsAvailablePage.date().contains('2 January 2020')
    videoLinkIsAvailablePage.startTime().contains('13:00')
    videoLinkIsAvailablePage.endTime().contains('13:30')
    videoLinkIsAvailablePage.legalBriefingBefore().contains('12:40 to 13:00')
    videoLinkIsAvailablePage.legalBriefingAfter().contains('13:30 to 13:50')
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()
    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.selectPreAppointmentLocation().select('100')
    selectAvailableRoomsForm.selectMainAppointmentLocation().select('110')
    selectAvailableRoomsForm.selectPostAppointmentLocation().select('120')
    selectAvailableRoomsForm.comments().contains('A comment')
    selectAvailableRoomsPage.bookVideoLink().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains('2 January 2020')
    confirmationPage.startTime().contains('13:00')
    confirmationPage.endTime().contains('13:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 12:40 to 13:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 13:30 to 13:50')
    confirmationPage.courtLocation().contains('Leeds')
    confirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
  })
})

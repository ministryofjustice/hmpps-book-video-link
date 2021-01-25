const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeDateAndTimePage = require('../../../pages/amendBooking/changeDateAndTimePage')
const VideoLinkNotAvailablePage = require('../../../pages/amendBooking/videoLinkNotAvailablePage')

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

    cy.task('stubAppointmentLocations', {
      agency: '.*?',
      locations: [],
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

    cy.task('stubAgencyDetails', {
      agencyId: 'WWI',
      details: { agencyId: 'WWI', description: 'Wandsworth', agencyType: 'INST' },
    })

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

    cy.task('stubLoginCourt')

    cy.task('stubRoomAvailability', {
      pre: [],
      main: [],
      post: [],
    })
  })

  it('A user is not able to amend a booking as no rooms available', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()

    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().type(tomorrow.format('DD/MM/YYYY'))
    changeDateAndTimePage.activeDate().click()
    changeDateAndTimePage.form.startTimeHours().select('10')
    changeDateAndTimePage.form.startTimeMinutes().select('55')
    changeDateAndTimePage.form.endTimeHours().select('11')
    changeDateAndTimePage.form.endTimeMinutes().select('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().click()
    changeDateAndTimePage.form.postAppointmentRequiredYes().click()
    changeDateAndTimePage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.date().contains(tomorrow.format('dddd D MMMM YYYY'))
    videoLinkNotAvailablePage.startTime().contains('10:55')
    videoLinkNotAvailablePage.endTime().contains('11:55')
  })

  it('Should redirect user to retry with alternative appointment and previous request should already be populated', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()
    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().type(tomorrow.format('DD/MM/YYYY'))
    changeDateAndTimePage.activeDate().click()
    changeDateAndTimePage.form.startTimeHours().select('10')
    changeDateAndTimePage.form.startTimeMinutes().select('55')
    changeDateAndTimePage.form.endTimeHours().select('11')
    changeDateAndTimePage.form.endTimeMinutes().select('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().click()
    changeDateAndTimePage.form.postAppointmentRequiredYes().click()
    changeDateAndTimePage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.continue().click()

    ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().should('have.value', tomorrow.format('DD/MM/YYYY'))
    changeDateAndTimePage.form.startTimeHours().contains('10')
    changeDateAndTimePage.form.startTimeMinutes().contains('55')
    changeDateAndTimePage.form.endTimeHours().contains('11')
    changeDateAndTimePage.form.startTimeMinutes().contains('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().should('have.value', 'yes')
    changeDateAndTimePage.form.postAppointmentRequiredYes().should('have.value', 'yes')
  })

  it('Should redirect to details page', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()
    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().type(tomorrow.format('DD/MM/YYYY'))
    changeDateAndTimePage.activeDate().click()
    changeDateAndTimePage.form.startTimeHours().select('10')
    changeDateAndTimePage.form.startTimeMinutes().select('55')
    changeDateAndTimePage.form.endTimeHours().select('11')
    changeDateAndTimePage.form.endTimeMinutes().select('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().click()
    changeDateAndTimePage.form.postAppointmentRequiredYes().click()
    changeDateAndTimePage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.cancel().click()

    BookingDetailsPage.verifyOnPage('John Doe’s')
  })
})

const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeVideoLinkPage = require('../../../pages/amendBooking/changeVideoLinkPage')
const VideoLinkNotAvailablePage = require('../../../pages/amendBooking/videoLinkNotAvailablePage')

context('Booking is not available', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})
    cy.login()

    cy.task('stubGetRooms', {
      agencyId: 'WWI',
      rooms: [
        { locationId: 100, description: 'Room 1', locationType: 'VIDE' },
        { locationId: 110, description: 'Room 2', locationType: 'VIDE' },
        { locationId: 120, description: 'Room 3', locationType: 'VIDE' },
      ],
    })

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Leeds',
      videoLinkBookingId: 10,
      pre: {
        locationId: 100,
        startTime: '2020-01-02T12:45:00',
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
        endTime: '2020-01-02T13:45:00',
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

    cy.task('stubRoomAvailability', {
      pre: [],
      main: [],
      post: [],
    })

    cy.task('stubAvailabilityCheck', { matched: false, alternatives: [] })
  })

  it('A user is not able to amend a booking as no rooms available', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.activeDate().click()
    changeVideoLinkPage.form.startTimeHours().select('10')
    changeVideoLinkPage.form.startTimeMinutes().select('30')
    changeVideoLinkPage.form.endTimeHours().select('11')
    changeVideoLinkPage.form.endTimeMinutes().select('00')
    changeVideoLinkPage.form.mainLocation().select('110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkPage.form.preLocation().select('100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkPage.form.postLocation().select('120')
    changeVideoLinkPage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.date().contains(tomorrow.format('dddd D MMMM YYYY'))
    videoLinkNotAvailablePage.startTime().contains('10:15')
    videoLinkNotAvailablePage.endTime().contains('11:15')
  })

  it('Should redirect user to retry with alternative appointment and previous request should already be populated', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()
    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.activeDate().click()
    changeVideoLinkPage.form.startTimeHours().select('11')
    changeVideoLinkPage.form.startTimeMinutes().select('00')
    changeVideoLinkPage.form.endTimeHours().select('11')
    changeVideoLinkPage.form.endTimeMinutes().select('30')
    changeVideoLinkPage.form.mainLocation().select('110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkPage.form.preLocation().select('100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkPage.form.postLocation().select('120')
    changeVideoLinkPage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.continue().click()

    ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().should('have.value', tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.startTimeHours().contains('10')
    changeVideoLinkPage.form.startTimeMinutes().contains('45')
    changeVideoLinkPage.form.endTimeHours().contains('11')
    changeVideoLinkPage.form.startTimeMinutes().contains('45')
    changeVideoLinkPage.form.preAppointmentRequiredYes().should('have.value', 'true')
    changeVideoLinkPage.form.postAppointmentRequiredYes().should('have.value', 'true')
  })

  it('Cancellation should redirect to details page', () => {
    const tomorrow = moment().add(1, 'days')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()
    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.activeDate().click()
    changeVideoLinkPage.form.startTimeHours().select('11')
    changeVideoLinkPage.form.startTimeMinutes().select('00')
    changeVideoLinkPage.form.endTimeHours().select('11')
    changeVideoLinkPage.form.endTimeMinutes().select('30')
    changeVideoLinkPage.form.mainLocation().select('110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkPage.form.preLocation().select('100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkPage.form.postLocation().select('120')
    changeVideoLinkPage.form.continue().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.cancel().click()

    BookingDetailsPage.verifyOnPage('John Doe’s')
  })
})

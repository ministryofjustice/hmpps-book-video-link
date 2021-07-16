const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeVideoLinkPage = require('../../../pages/amendBooking/changeVideoLinkPage')
const ConfirmUpdatedBookingPage = require('../../../pages/amendBooking/confirmUpdatedBookingPage')
const NoLongerAvailablePage = require('../../../pages/amendBooking/noLongerAvailablePage')

const room1 = { locationId: 100, description: 'Room 1', locationType: 'VIDE' }
const room2 = { locationId: 110, description: 'Room 2', locationType: 'VIDE' }
const room3 = { locationId: 120, description: 'Room 3', locationType: 'VIDE' }
const room4 = { locationId: 130, description: 'Room 4', locationType: 'VIDE' }

context('Final availability checks before submitting update', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.task('stubGetRooms', {
      agencyId: 'WWI',
      rooms: [
        { locationId: 100, description: 'Room 1', locationType: 'VIDE' },
        { locationId: 110, description: 'Room 2', locationType: 'VIDE' },
        { locationId: 120, description: 'Room 3', locationType: 'VIDE' },
        { locationId: 130, description: 'Room 4', locationType: 'VIDE' },
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
  })

  it('Last room taken leading to no longer having any availability', () => {
    cy.task('stubLoginCourt', {})
    cy.task('stubUpdateVideoLinkBooking', 10)

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

    cy.task('stubAvailabilityCheck', { matched: true, alternatives: [] })
    cy.task('stubRoomAvailability', { pre: [room1, room4], main: [room2], post: [room3] })

    changeVideoLinkPage.form.continue().click()

    const confirmUpdatedBookingPage = ConfirmUpdatedBookingPage.verifyOnPage()

    cy.task('stubAvailabilityCheck', { matched: false, alternatives: [] })
    cy.task('stubRoomAvailability', { pre: [], main: [room2], post: [room3] })

    confirmUpdatedBookingPage.updateVideoLink().click()

    const noLongerAvailablePage = NoLongerAvailablePage.verifyOnPage()
    noLongerAvailablePage.continue().click()

    ChangeVideoLinkPage.verifyOnPage()
  })
})

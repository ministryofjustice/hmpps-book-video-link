const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeDateAndTimePage = require('../../../pages/amendBooking/changeDateAndTimePage')
const VideoLinkIsAvailablePage = require('../../../pages/amendBooking/videoLinkIsAvailablePage')
const SelectAvailableRoomsPage = require('../../../pages/amendBooking/selectAvailableRoomsPage')
const NoLongerAvailablePage = require('../../../pages/amendBooking/noLongerAvailablePage')
const VideoLinkNotAvailablePage = require('../../../pages/amendBooking/videoLinkNotAvailablePage')

const room1 = { locationId: 100, description: 'Room 1', locationType: 'VIDE' }
const room2 = { locationId: 110, description: 'Room 2', locationType: 'VIDE' }
const room3 = { locationId: 120, description: 'Room 3', locationType: 'VIDE' }
const room4 = { locationId: 130, description: 'Room 4', locationType: 'VIDE' }

context('Final availability checks before submitting update', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()

    cy.task('stubAppointmentLocations', { agency: 'WWI', locations: [room1, room2, room3, room4] })

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
  })

  it('Room no longer available', () => {
    cy.task('stubLoginCourt')
    cy.task('stubUpdateVideoLinkBooking', 10)

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

    cy.task('stubRoomAvailability', { pre: [room1, room4], main: [room2], post: [room3] })

    changeDateAndTimePage.form.continue().click()

    VideoLinkIsAvailablePage.verifyOnPage().continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('110')
    selectAvailableRoomsForm.postLocation().select('120')

    cy.task('stubRoomAvailability', { pre: [room4], main: [room2], post: [room3] })

    selectAvailableRoomsPage.bookVideoLink().click()

    const noLongerAvailablePage = NoLongerAvailablePage.verifyOnPage()
    noLongerAvailablePage.continue().click()

    SelectAvailableRoomsPage.verifyOnPage()
  })

  it('Last room taken leading to no longer having any availability', () => {
    cy.task('stubLoginCourt')
    cy.task('stubUpdateVideoLinkBooking', 10)

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

    cy.task('stubRoomAvailability', { pre: [room1, room4], main: [room2], post: [room3] })

    changeDateAndTimePage.form.continue().click()

    VideoLinkIsAvailablePage.verifyOnPage().continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('110')
    selectAvailableRoomsForm.postLocation().select('120')

    cy.task('stubRoomAvailability', { pre: [], main: [room2], post: [room3] })

    selectAvailableRoomsPage.bookVideoLink().click()

    const videoLinkNotAvailablePage = VideoLinkNotAvailablePage.verifyOnPage()
    videoLinkNotAvailablePage.continue().click()

    ChangeDateAndTimePage.verifyOnPage()
  })
})

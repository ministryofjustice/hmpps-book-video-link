const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeDateAndTimePage = require('../../../pages/amendBooking/changeDateAndTimePage')
const VideoLinkIsAvailablePage = require('../../../pages/amendBooking/videoLinkIsAvailablePage')
const SelectAvailableRoomsPage = require('../../../pages/amendBooking/selectAvailableRoomsPage')
const ConfirmationPage = require('../../../pages/amendBooking/confirmationPage')
const CourtVideoLinkBookingsPage = require('../../../pages/viewBookings/courtVideoBookingsPage')
const ChangeTimePage = require('../../../pages/amendBooking/changeTimePage')

context('A user can amend a booking', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
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

    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 100, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 110, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 120, description: 'Room 3', locationType: 'VIDE' }],
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

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.offenderName().contains('John Doe')
    videoLinkIsAvailablePage.prison().contains('Wandsworth')
    videoLinkIsAvailablePage.courtLocation().contains('Leeds')
    videoLinkIsAvailablePage.date().contains(tomorrow.format('D MMMM YYYY'))
    videoLinkIsAvailablePage.startTime().contains('10:55')
    videoLinkIsAvailablePage.endTime().contains('11:55')
    videoLinkIsAvailablePage.legalBriefingBefore().contains('10:35 to 10:55')
    videoLinkIsAvailablePage.legalBriefingAfter().contains('11:55 to 12:15')
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request).to.deep.equal([
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [],
          preInterval: { start: '10:35', end: '10:55' },
          mainInterval: { start: '10:55', end: '11:55' },
          postInterval: { start: '11:55', end: '12:15' },
        },
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [],
          preInterval: { start: '10:35', end: '10:55' },
          mainInterval: { start: '10:55', end: '11:55' },
          postInterval: { start: '11:55', end: '12:15' },
        },
      ])
    })

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('110')
    selectAvailableRoomsForm.postLocation().select('120')
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

  it('A user can view date in change-time page', () => {
    cy.task('stubLoginCourt')
    ChangeTimePage.goTo(10)
    const changeTimePage = ChangeTimePage.verifyOnPage()
    changeTimePage.date().should('have.value', '02/01/2020')
  })

  it('A user will be shown a validation message when a past date is provided', () => {
    cy.task('stubLoginCourt')
    const yesterday = moment().subtract(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()

    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().type(yesterday.format('DD/MM/YYYY'))
    changeDateAndTimePage.form.date().type('{esc}')
    changeDateAndTimePage.form.startTimeHours().select('10')
    changeDateAndTimePage.form.startTimeMinutes().select('55')
    changeDateAndTimePage.form.endTimeHours().select('11')
    changeDateAndTimePage.form.endTimeMinutes().select('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().click()
    changeDateAndTimePage.form.postAppointmentRequiredYes().click()
    changeDateAndTimePage.form.continue().click()

    ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().should('have.value', yesterday.format('DD/MM/YYYY'))
    changeDateAndTimePage.form.startTimeHours().contains('10')
    changeDateAndTimePage.form.startTimeMinutes().contains('55')
    changeDateAndTimePage.form.endTimeHours().contains('11')
    changeDateAndTimePage.form.endTimeMinutes().contains('55')
    changeDateAndTimePage.form.preAppointmentRequiredYes().should('have.value', 'yes')
    changeDateAndTimePage.form.postAppointmentRequiredYes().should('have.value', 'yes')

    changeDateAndTimePage.errorSummaryTitle().contains('There is a problem')
    changeDateAndTimePage.errorSummaryBody().contains('Select a date that is not in the past')
    changeDateAndTimePage.form.inlineError().contains('Select a date that is not in the past')
  })

  it('A user will be shown a validation message when selecting the same location for pre and main rooms', () => {
    cy.task('stubLoginCourt')
    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 100, description: 'Room 1', locationType: 'VIDE' }],
      main: [
        { locationId: 100, description: 'Room 1', locationType: 'VIDE' },
        { locationId: 110, description: 'Room 2', locationType: 'VIDE' },
      ],
      post: [{ locationId: 120, description: 'Room 3', locationType: 'VIDE' }],
    })
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

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('100')
    selectAvailableRoomsForm.postLocation().select('120')
    selectAvailableRoomsPage.bookVideoLink().click()

    SelectAvailableRoomsPage.verifyOnPage()
    selectAvailableRoomsForm.preLocation().should('have.value', '100')
    selectAvailableRoomsForm.mainLocation().should('have.value', '100')
    selectAvailableRoomsForm.postLocation().should('have.value', '120')
    selectAvailableRoomsPage.errorSummaryTitle().contains('There is a problem')
    selectAvailableRoomsPage
      .errorSummaryBody()
      .contains('Select a different room for the pre-court hearing to the room for the court hearing briefing')
    selectAvailableRoomsForm
      .inlineError()
      .contains('Select a different room for the pre-court hearing to the room for the court hearing briefing')
  })

  it('Select drop downs for pre and post are not displayed when pre and post appointments are not present', () => {
    const tomorrow = moment().add(1, 'days')
    cy.task('stubLoginCourt')
    cy.task('stubRoomAvailability', {
      main: [{ locationId: 100, description: 'Room 1', locationType: 'VIDE' }],
    })
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Leeds',
      videoLinkBookingId: 10,
      main: {
        locationId: 110,
        startTime: '2020-01-02T13:00:00',
        endTime: '2020-01-02T13:30:00',
      },
    })

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDate().click()

    const changeDateAndTimePage = ChangeDateAndTimePage.verifyOnPage()
    changeDateAndTimePage.form.date().type(tomorrow.format('DD/MM/YYYY'))
    changeDateAndTimePage.activeDate().click()
    changeDateAndTimePage.form.startTimeHours().select('10')
    changeDateAndTimePage.form.startTimeMinutes().select('55')
    changeDateAndTimePage.form.endTimeHours().select('11')
    changeDateAndTimePage.form.endTimeMinutes().select('55')
    changeDateAndTimePage.form.preAppointmentRequiredNo().click()
    changeDateAndTimePage.form.postAppointmentRequiredNo().click()
    changeDateAndTimePage.form.continue().click()

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().should('not.exist')
    selectAvailableRoomsForm.mainLocation().select('100')
    selectAvailableRoomsForm.postLocation().should('not.exist')
  })

  it('A user will be navigated to the booking-details page', () => {
    cy.task('stubLoginCourt')
    ChangeTimePage.goTo(10)
    const changeTimePage = ChangeTimePage.verifyOnPage()
    changeTimePage.cancel().click()
    BookingDetailsPage.verifyOnPage('John Doe’s')
  })
})

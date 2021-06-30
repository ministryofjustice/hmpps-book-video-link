const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeVideoLinkBookingPage = require('../../../pages/amendBooking/changeVideoLinkBookingPage')
const VideoLinkIsAvailablePage = require('../../../pages/amendBooking/videoLinkIsAvailablePage')
const SelectAvailableRoomsPage = require('../../../pages/amendBooking/selectAvailableRoomsPage')
const ConfirmationPage = require('../../../pages/amendBooking/confirmationPage')
const CourtVideoLinkBookingsPage = require('../../../pages/viewBookings/courtVideoBookingsPage')

context('A user can amend a booking', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    // Stub booking list
    cy.task('stubCourts')
    cy.task('stubFindPrisonersByBookingIds', [
      { bookingId: 1, firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: 2, firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubGetVideoLinkBookings', {
      agencyId: '.*?',
      courtId: '.*?',
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

    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 100, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 110, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 120, description: 'Room 3', locationType: 'VIDE' }],
    })

    cy.task('stubGetVideoLinkBookings', {
      agencyId: 'WWI',
      date: moment().format('yyyy-MM-DD'),
      courtId: 'ABDRCT',
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
            startTime: '2020-01-02T14:45:00',
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

  it('A user with a single preferred court can view prepopulated booking information', () => {
    ChangeVideoLinkBookingPage.goTo(10)
    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.summaryListCourt().contains('Aberdare County Court')
    changeVideoLinkBookingPage.form.date().should('have.value', '02/01/2020')
    changeVideoLinkBookingPage.form.startTimeHours().should('have.value', '13')
    changeVideoLinkBookingPage.form.startTimeMinutes().should('have.value', '00')
    changeVideoLinkBookingPage.form.endTimeHours().should('have.value', '13')
    changeVideoLinkBookingPage.form.endTimeMinutes().should('have.value', '30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredYes().should('be.checked').and('have.value', 'yes')
    changeVideoLinkBookingPage.form.postAppointmentRequiredYes().should('be.checked').and('have.value', 'yes')
  })

  it('A user with multiple preferred courts can view prepopulated booking information', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Banbury County Court',
      courtId: 'BANBCT',
      videoLinkBookingId: 10,
      main: {
        locationId: 110,
        startTime: '2020-01-02T13:00:00',
        endTime: '2020-01-02T13:30:00',
      },
    })
    ChangeVideoLinkBookingPage.goTo(10)
    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.court().should('have.value', 'BANBCT')
  })

  it('A user with a single preferred court can successfully amend a booking', () => {
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDateAndTime().click()

    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.court().contains('Aberdare County Court')
    changeVideoLinkBookingPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkBookingPage.form.date().type('{esc}')
    changeVideoLinkBookingPage.form.startTimeHours().select('11')
    changeVideoLinkBookingPage.form.startTimeMinutes().select('00')
    changeVideoLinkBookingPage.form.endTimeHours().select('11')
    changeVideoLinkBookingPage.form.endTimeMinutes().select('30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.continue().click()

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.offenderName().contains('John Doe')
    videoLinkIsAvailablePage.prison().contains('Wandsworth')
    videoLinkIsAvailablePage.courtLocation().contains('Aberdare County Court')
    videoLinkIsAvailablePage.date().contains(tomorrow.format('D MMMM YYYY'))
    videoLinkIsAvailablePage.startTime().contains('11:00')
    videoLinkIsAvailablePage.endTime().contains('11:30')
    videoLinkIsAvailablePage.legalBriefingBefore().contains('10:45 to 11:00')
    videoLinkIsAvailablePage.legalBriefingAfter().contains('11:30 to 11:45')
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()
    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('110')
    selectAvailableRoomsForm.postLocation().select('120')
    selectAvailableRoomsForm.comments().contains('A comment')
    cy.task('stubUpdateVideoLinkBooking', 10)
    selectAvailableRoomsPage.updateVideoLink().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains('2 January 2020')
    confirmationPage.startTime().contains('13:00')
    confirmationPage.endTime().contains('13:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 12:45 to 13:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 13:30 to 13:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
    confirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()

    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request).to.deep.equal([
        // Initial availability check
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
        // To retrieve available rooms
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
        // Final check, just before submitting
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
      ])
    })
  })

  it('A user with multiple preferred courts can successfully amend a booking', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDateAndTime().click()

    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.court().should('have.value', 'ABDRCT')
    changeVideoLinkBookingPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkBookingPage.form.date().type('{esc}')
    changeVideoLinkBookingPage.form.startTimeHours().select('11')
    changeVideoLinkBookingPage.form.startTimeMinutes().select('00')
    changeVideoLinkBookingPage.form.endTimeHours().select('11')
    changeVideoLinkBookingPage.form.endTimeMinutes().select('30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.continue().click()

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.offenderName().contains('John Doe')
    videoLinkIsAvailablePage.prison().contains('Wandsworth')
    videoLinkIsAvailablePage.courtLocation().contains('Aberdare County Court')
    videoLinkIsAvailablePage.date().contains(tomorrow.format('D MMMM YYYY'))
    videoLinkIsAvailablePage.startTime().contains('11:00')
    videoLinkIsAvailablePage.endTime().contains('11:30')
    videoLinkIsAvailablePage.legalBriefingBefore().contains('10:45 to 11:00')
    videoLinkIsAvailablePage.legalBriefingAfter().contains('11:30 to 11:45')
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()
    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().select('100')
    selectAvailableRoomsForm.mainLocation().select('110')
    selectAvailableRoomsForm.postLocation().select('120')
    selectAvailableRoomsForm.comments().contains('A comment')
    cy.task('stubUpdateVideoLinkBooking', 10)
    selectAvailableRoomsPage.updateVideoLink().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains('2 January 2020')
    confirmationPage.startTime().contains('13:00')
    confirmationPage.endTime().contains('13:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 12:45 to 13:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 13:30 to 13:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
    confirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()

    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request).to.deep.equal([
        // Initial availability check
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
        // To retrieve available rooms
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
        // Final check, just before submitting
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdsToExclude: [10],
          preInterval: { start: '10:45', end: '11:00' },
          mainInterval: { start: '11:00', end: '11:30' },
          postInterval: { start: '11:30', end: '11:45' },
        },
      ])
    })

    const tomorrowDate = tomorrow.format('YYYY-MM-DD')
    cy.task('getUpdateBookingRequest').then(request =>
      expect(request).to.deep.equal({
        comment: 'A comment',
        pre: { locationId: 100, startTime: `${tomorrowDate}T10:45:00`, endTime: `${tomorrowDate}T11:00:00` },
        main: { locationId: 110, startTime: `${tomorrowDate}T11:00:00`, endTime: `${tomorrowDate}T11:30:00` },
        post: { locationId: 120, startTime: `${tomorrowDate}T11:30:00`, endTime: `${tomorrowDate}T11:45:00` },
      })
    )
  })

  it('A user will be shown a validation message when a past date is provided', () => {
    const yesterday = moment().subtract(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDateAndTime().click()

    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.date().clear().type(yesterday.format('DD/MM/YYYY'))
    changeVideoLinkBookingPage.form.date().type('{esc}')
    changeVideoLinkBookingPage.form.startTimeHours().select('11')
    changeVideoLinkBookingPage.form.startTimeMinutes().select('00')
    changeVideoLinkBookingPage.form.endTimeHours().select('11')
    changeVideoLinkBookingPage.form.endTimeMinutes().select('30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkBookingPage.form.continue().click()

    ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.date().should('have.value', yesterday.format('DD/MM/YYYY'))
    changeVideoLinkBookingPage.form.startTimeHours().contains('11')
    changeVideoLinkBookingPage.form.startTimeMinutes().contains('00')
    changeVideoLinkBookingPage.form.endTimeHours().contains('11')
    changeVideoLinkBookingPage.form.endTimeMinutes().contains('30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredYes().should('have.value', 'yes')
    changeVideoLinkBookingPage.form.postAppointmentRequiredYes().should('have.value', 'yes')

    changeVideoLinkBookingPage.errorSummaryTitle().contains('There is a problem')
    changeVideoLinkBookingPage.errorSummaryBody().contains('Select a date that is not in the past')
    changeVideoLinkBookingPage.form.inlineError().contains('Select a date that is not in the past')
  })

  it('Select drop downs for pre and post are not displayed when pre and post appointments are not present', () => {
    const tomorrow = moment().add(1, 'days')
    cy.task('stubRoomAvailability', {
      main: [{ locationId: 100, description: 'Room 1', locationType: 'VIDE' }],
    })
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Aberdare County Court',
      videoLinkBookingId: 10,
      main: {
        locationId: 110,
        startTime: '2020-01-02T13:00:00',
        endTime: '2020-01-02T13:30:00',
      },
    })

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeDateAndTime().click()

    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkBookingPage.form.date().type('{esc}')
    changeVideoLinkBookingPage.form.startTimeHours().select('11')
    changeVideoLinkBookingPage.form.startTimeMinutes().select('00')
    changeVideoLinkBookingPage.form.endTimeHours().select('11')
    changeVideoLinkBookingPage.form.endTimeMinutes().select('30')
    changeVideoLinkBookingPage.form.preAppointmentRequiredNo().click()
    changeVideoLinkBookingPage.form.postAppointmentRequiredNo().click()
    changeVideoLinkBookingPage.form.continue().click()

    const videoLinkIsAvailablePage = VideoLinkIsAvailablePage.verifyOnPage()
    videoLinkIsAvailablePage.continue().click()

    const selectAvailableRoomsPage = SelectAvailableRoomsPage.verifyOnPage()

    const selectAvailableRoomsForm = selectAvailableRoomsPage.form()
    selectAvailableRoomsForm.preLocation().should('not.exist')
    selectAvailableRoomsForm.mainLocation().select('100')
    selectAvailableRoomsForm.postLocation().should('not.exist')
  })

  it('A user will be navigated back to the booking-details page', () => {
    ChangeVideoLinkBookingPage.goTo(10)
    const changeVideoLinkBookingPage = ChangeVideoLinkBookingPage.verifyOnPage()
    changeVideoLinkBookingPage.form.cancel().click()
    BookingDetailsPage.verifyOnPage('John Doe’s')
  })
})

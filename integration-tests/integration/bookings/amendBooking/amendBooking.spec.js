const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const ChangeVideoLinkPage = require('../../../pages/amendBooking/changeVideoLinkPage')
const ConfirmUpdatedBookingPage = require('../../../pages/amendBooking/confirmUpdatedBookingPage')
const ConfirmationPage = require('../../../pages/amendBooking/confirmationPage')
const CourtVideoLinkBookingsPage = require('../../../pages/viewBookings/courtVideoBookingsPage')
const VideoLinkNotAvailablePage = require('../../../pages/amendBooking/videoLinkNotAvailablePage')
const NoLongerAvailablePage = require('../../../pages/amendBooking/noLongerAvailablePage')

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
    cy.task('stubAvailabilityCheck', { matched: true })
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
    ChangeVideoLinkPage.goTo(10)
    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.summaryListCourt().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().should('have.value', '02/01/2020')
    changeVideoLinkPage.form.startTimeHours().should('have.value', '13')
    changeVideoLinkPage.form.startTimeMinutes().should('have.value', '00')
    changeVideoLinkPage.form.endTimeHours().should('have.value', '13')
    changeVideoLinkPage.form.endTimeMinutes().should('have.value', '30')
    changeVideoLinkPage.form.preAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.postAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.preLocation().should('have.value', '100')
    changeVideoLinkPage.form.mainLocation().should('have.value', '110')
    changeVideoLinkPage.form.postLocation().should('have.value', '120')
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
    ChangeVideoLinkPage.goTo(10)
    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().should('have.value', 'BANBCT')
  })

  it('A user with a single preferred court can successfully amend a booking', () => {
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
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

    const confirmUpdatedBookingPage = ConfirmUpdatedBookingPage.verifyOnPage()
    confirmUpdatedBookingPage.offenderName().contains('John Doe')
    confirmUpdatedBookingPage.prison().contains('Wandsworth')
    confirmUpdatedBookingPage.courtLocation().contains('Aberdare County Court')
    confirmUpdatedBookingPage.date().contains(tomorrow.format('D MMMM YYYY'))
    confirmUpdatedBookingPage.mainTimes().contains('11:00 to 11:30')
    confirmUpdatedBookingPage.mainRoom().contains('Room 2')
    confirmUpdatedBookingPage.legalBriefingBeforeTimes().contains('10:45 to 11:00')
    confirmUpdatedBookingPage.legalBriefingBeforeRoom().contains('Room 1')
    confirmUpdatedBookingPage.legalBriefingAfterTimes().contains('11:30 to 11:45')
    confirmUpdatedBookingPage.legalBriefingAfterRoom().contains('Room 3')
    confirmUpdatedBookingPage.form.comment().contains('A comment')
    cy.task('stubAvailabilityCheck', { matched: true })
    cy.task('stubUpdateVideoLinkBooking', 10)

    const tomorrowDate = tomorrow.format('YYYY-MM-DD')
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Aberdare County Court',
      courtId: 'ABDRCT',
      videoLinkBookingId: 10,
      pre: { locationId: 100, startTime: `${tomorrowDate}T10:45:00`, endTime: `${tomorrowDate}T11:00:00` },
      main: { locationId: 110, startTime: `${tomorrowDate}T11:00:00`, endTime: `${tomorrowDate}T11:30:00` },
      post: { locationId: 120, startTime: `${tomorrowDate}T11:30:00`, endTime: `${tomorrowDate}T11:45:00` },
    })

    confirmUpdatedBookingPage.updateVideoLink().click()

    cy.task('getUpdateBookingRequest').then(request =>
      expect(request).to.deep.equal({
        courtId: 'ABDRCT',
        comment: 'A comment',
        pre: { locationId: 100, startTime: `${tomorrowDate}T10:45:00`, endTime: `${tomorrowDate}T11:00:00` },
        main: { locationId: 110, startTime: `${tomorrowDate}T11:00:00`, endTime: `${tomorrowDate}T11:30:00` },
        post: { locationId: 120, startTime: `${tomorrowDate}T11:30:00`, endTime: `${tomorrowDate}T11:45:00` },
      })
    )

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains(tomorrow.format('D MMMM YYYY'))
    confirmationPage.startTime().contains('11:00')
    confirmationPage.endTime().contains('11:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 10:45 to 11:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 11:30 to 11:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
    confirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()

    cy.task('getAvailabilityCheckRequests').then(request => {
      expect(request).to.deep.equal([
        // Initial availability check
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdToExclude: 10,
          preAppointment: {
            interval: { start: '10:45', end: '11:00' },
            locationId: 100,
          },
          mainAppointment: {
            interval: { start: '11:00', end: '11:30' },
            locationId: 110,
          },
          postAppointment: {
            interval: { start: '11:30', end: '11:45' },
            locationId: 120,
          },
        },
        // Final check, just before submitting
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdToExclude: 10,
          preAppointment: {
            interval: { start: '10:45', end: '11:00' },
            locationId: 100,
          },
          mainAppointment: {
            interval: { start: '11:00', end: '11:30' },
            locationId: 110,
          },
          postAppointment: {
            interval: { start: '11:30', end: '11:45' },
            locationId: 120,
          },
        },
      ])
    })
  })

  it('A user with multiple preferred courts can successfully amend a booking', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().should('have.value', 'ABDRCT')
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
    changeVideoLinkPage.form.startTimeHours().select('11')
    changeVideoLinkPage.form.startTimeMinutes().select('00')
    changeVideoLinkPage.form.endTimeHours().select('11')
    changeVideoLinkPage.form.endTimeMinutes().select('30')
    changeVideoLinkPage.form.mainLocation().select('110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkPage.form.preLocation().select('100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkPage.form.postLocation().select('120')
    cy.task('stubAvailabilityCheck', { matched: true })
    changeVideoLinkPage.form.continue().click()

    const confirmUpdatedBookingPage = ConfirmUpdatedBookingPage.verifyOnPage()
    confirmUpdatedBookingPage.offenderName().contains('John Doe')
    confirmUpdatedBookingPage.prison().contains('Wandsworth')
    confirmUpdatedBookingPage.courtLocation().contains('Aberdare County Court')
    confirmUpdatedBookingPage.date().contains(tomorrow.format('D MMMM YYYY'))
    confirmUpdatedBookingPage.mainTimes().contains('11:00 to 11:30')
    confirmUpdatedBookingPage.mainRoom().contains('Room 2')
    confirmUpdatedBookingPage.legalBriefingBeforeTimes().contains('10:45 to 11:00')
    confirmUpdatedBookingPage.legalBriefingBeforeRoom().contains('Room 1')
    confirmUpdatedBookingPage.legalBriefingAfterTimes().contains('11:30 to 11:45')
    confirmUpdatedBookingPage.legalBriefingAfterRoom().contains('Room 3')
    confirmUpdatedBookingPage.form.comment().contains('A comment')
    cy.task('stubAvailabilityCheck', { matched: true })
    cy.task('stubUpdateVideoLinkBooking', 10)

    const tomorrowDate = tomorrow.format('YYYY-MM-DD')
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Aberdare County Court',
      courtId: 'ABDRCT',
      videoLinkBookingId: 10,
      pre: { locationId: 100, startTime: `${tomorrowDate}T10:45:00`, endTime: `${tomorrowDate}T11:00:00` },
      main: { locationId: 110, startTime: `${tomorrowDate}T11:00:00`, endTime: `${tomorrowDate}T11:30:00` },
      post: { locationId: 120, startTime: `${tomorrowDate}T11:30:00`, endTime: `${tomorrowDate}T11:45:00` },
    })

    confirmUpdatedBookingPage.updateVideoLink().click()

    cy.task('getUpdateBookingRequest').then(request =>
      expect(request).to.deep.equal({
        courtId: 'ABDRCT',
        comment: 'A comment',
        pre: { locationId: 100, startTime: `${tomorrowDate}T10:45:00`, endTime: `${tomorrowDate}T11:00:00` },
        main: { locationId: 110, startTime: `${tomorrowDate}T11:00:00`, endTime: `${tomorrowDate}T11:30:00` },
        post: { locationId: 120, startTime: `${tomorrowDate}T11:30:00`, endTime: `${tomorrowDate}T11:45:00` },
      })
    )

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains(tomorrow.format('D MMMM YYYY'))
    confirmationPage.startTime().contains('11:00')
    confirmationPage.endTime().contains('11:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 10:45 to 11:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 11:30 to 11:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
    confirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()

    cy.task('getAvailabilityCheckRequests').then(request => {
      expect(request).to.deep.equal([
        // Initial availability check
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdToExclude: 10,
          preAppointment: {
            interval: { start: '10:45', end: '11:00' },
            locationId: 100,
          },
          mainAppointment: {
            interval: { start: '11:00', end: '11:30' },
            locationId: 110,
          },
          postAppointment: {
            interval: { start: '11:30', end: '11:45' },
            locationId: 120,
          },
        },
        // Final check, just before submitting
        {
          agencyId: 'WWI',
          date: tomorrow.format('YYYY-MM-DD'),
          vlbIdToExclude: 10,
          preAppointment: {
            interval: { start: '10:45', end: '11:00' },
            locationId: 100,
          },
          mainAppointment: {
            interval: { start: '11:00', end: '11:30' },
            locationId: 110,
          },
          postAppointment: {
            interval: { start: '11:30', end: '11:45' },
            locationId: 120,
          },
        },
      ])
    })
  })

  it('A user will be shown a validation message when a past date is provided', () => {
    const yesterday = moment().subtract(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().clear().type(yesterday.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
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

    ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.date().should('have.value', yesterday.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.startTimeHours().contains('11')
    changeVideoLinkPage.form.startTimeMinutes().contains('00')
    changeVideoLinkPage.form.endTimeHours().contains('11')
    changeVideoLinkPage.form.endTimeMinutes().contains('30')
    changeVideoLinkPage.form.mainLocation().should('have.value', '110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().should('have.value', 'true')
    changeVideoLinkPage.form.preLocation().should('have.value', '100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().should('have.value', 'true')
    changeVideoLinkPage.form.postLocation().should('have.value', '120')
    changeVideoLinkPage.errorSummaryTitle().contains('There is a problem')
    changeVideoLinkPage.errorSummaryBody().contains('Select a date that is not in the past')
    changeVideoLinkPage.form.inlineError().contains('Select a date that is not in the past')
  })

  it('A user is redirected when option not available and then chooses alternative', () => {
    cy.task('stubAvailabilityCheck', {
      matched: false,
      alternatives: [
        {
          pre: { locationId: 1, interval: { start: '11:45', end: '12:00' } },
          main: { locationId: 2, interval: { start: '12:00', end: '12:30' } },
          post: { locationId: 3, interval: { start: '12:30', end: '12:45' } },
        },
      ],
    })
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
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
    videoLinkNotAvailablePage
      .info()
      .contains(`There are no video link bookings available at that time in the rooms selected.`)
    videoLinkNotAvailablePage.selectAlternative(1)

    const confirmUpdatedBookingPage = ConfirmUpdatedBookingPage.verifyOnPage()
    confirmUpdatedBookingPage.offenderName().contains('John Doe')
    confirmUpdatedBookingPage.prison().contains('Wandsworth')
    confirmUpdatedBookingPage.mainTimes().contains('12:00 to 12:30')
    confirmUpdatedBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmUpdatedBookingPage.legalBriefingBeforeTimes().contains('11:45 to 12:00')
    confirmUpdatedBookingPage.legalBriefingAfterTimes().contains('12:30 to 12:45')
    confirmUpdatedBookingPage.form.comment().contains('A comment')
    cy.task('stubAvailabilityCheck', { matched: true })
    cy.task('stubUpdateVideoLinkBooking', 10)

    const tomorrowDate = tomorrow.format('YYYY-MM-DD')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Aberdare County Court',
      courtId: 'ABDRCT',
      videoLinkBookingId: 10,
      pre: { locationId: 100, startTime: `${tomorrowDate}T11:45:00`, endTime: `${tomorrowDate}T12:00:00` },
      main: {
        locationId: 110,
        startTime: `${tomorrowDate}T12:00:00`,
        endTime: `${tomorrowDate}T12:30:00`,
      },
      post: { locationId: 120, startTime: `${tomorrowDate}T12:30:00`, endTime: `${tomorrowDate}T12:45:00` },
    })

    confirmUpdatedBookingPage.updateVideoLink().click()

    cy.task('getUpdateBookingRequest').then(request =>
      expect(request).to.deep.equal({
        courtId: 'ABDRCT',
        comment: 'A comment',
        pre: { locationId: 100, startTime: `${tomorrowDate}T11:45:00`, endTime: `${tomorrowDate}T12:00:00` },
        main: { locationId: 110, startTime: `${tomorrowDate}T12:00:00`, endTime: `${tomorrowDate}T12:30:00` },
        post: { locationId: 120, startTime: `${tomorrowDate}T12:30:00`, endTime: `${tomorrowDate}T12:45:00` },
      })
    )

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Wandsworth')
    confirmationPage.room().contains('Room 2')
    confirmationPage.date().contains(tomorrow.format('D MMMM YYYY'))
    confirmationPage.startTime().contains('12:00')
    confirmationPage.endTime().contains('12:30')
    confirmationPage.comments().contains('A comment')
    confirmationPage.legalBriefingBefore().contains('Room 1 - 11:45 to 12:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 12:30 to 12:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
  })

  it('A user is redirected when option not available but decides to search again with previous request pre-populated', () => {
    cy.task('stubAvailabilityCheck', {
      matched: false,
      alternatives: [
        {
          pre: { locationId: 1, interval: { start: '11:45', end: '12:00' } },
          main: { locationId: 2, interval: { start: '12:00', end: '12:30' } },
          post: { locationId: 3, interval: { start: '12:30', end: '12:45' } },
        },
      ],
    })
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
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
    videoLinkNotAvailablePage
      .info()
      .contains(`There are no video link bookings available at that time in the rooms selected.`)

    const tomorrowDate = tomorrow.format('YYYY-MM-DD')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment: 'A comment',
      court: 'Aberdare County Court',
      courtId: 'ABDRCT',
      videoLinkBookingId: 10,
      pre: { locationId: 100, startTime: `${tomorrowDate}T11:45:00`, endTime: `${tomorrowDate}T12:00:00` },
      main: {
        locationId: 110,
        startTime: `${tomorrowDate}T12:00:00`,
        endTime: `${tomorrowDate}T12:30:00`,
      },
      post: { locationId: 120, startTime: `${tomorrowDate}T12:30:00`, endTime: `${tomorrowDate}T12:45:00` },
    })

    videoLinkNotAvailablePage.searchAgainButton().click()

    ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.summaryListCourt().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().should('have.value', tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.startTimeHours().should('have.value', '11')
    changeVideoLinkPage.form.startTimeMinutes().should('have.value', '00')
    changeVideoLinkPage.form.endTimeHours().should('have.value', '11')
    changeVideoLinkPage.form.endTimeMinutes().should('have.value', '30')
    changeVideoLinkPage.form.preAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.postAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.preLocation().should('have.value', '100')
    changeVideoLinkPage.form.mainLocation().should('have.value', '110')
    changeVideoLinkPage.form.postLocation().should('have.value', '120')
  })

  it('A user selects rooms but they become unavailable before confirmation', () => {
    const tomorrow = moment().add(1, 'days')

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeBooking().click()

    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.court().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().clear().type(tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.date().type('{esc}')
    changeVideoLinkPage.form.startTimeHours().select('11')
    changeVideoLinkPage.form.startTimeMinutes().select('00')
    changeVideoLinkPage.form.endTimeHours().select('11')
    changeVideoLinkPage.form.endTimeMinutes().select('30')
    changeVideoLinkPage.form.mainLocation().select('110')
    changeVideoLinkPage.form.preAppointmentRequiredYes().click()
    changeVideoLinkPage.form.preLocation().select('100')
    changeVideoLinkPage.form.postAppointmentRequiredYes().click()
    changeVideoLinkPage.form.postLocation().select('120')
    cy.task('stubAvailabilityCheck', { matched: true })
    changeVideoLinkPage.form.continue().click()

    const confirmUpdatedBookingPage = ConfirmUpdatedBookingPage.verifyOnPage()
    confirmUpdatedBookingPage.offenderName().contains('John Doe')
    confirmUpdatedBookingPage.prison().contains('Wandsworth')
    confirmUpdatedBookingPage.mainTimes().contains('11:00 to 11:30')
    confirmUpdatedBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmUpdatedBookingPage.legalBriefingBeforeTimes().contains('10:45 to 11:00')
    confirmUpdatedBookingPage.legalBriefingAfterTimes().contains('11:30 to 11:45')
    confirmUpdatedBookingPage.form.comment().contains('A comment')
    cy.task('stubAvailabilityCheck', { matched: false, alternatives: [] })
    confirmUpdatedBookingPage.updateVideoLink().click()

    const noLongerAvailablePage = NoLongerAvailablePage.verifyOnPage()
    noLongerAvailablePage.continue().click()

    ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.summaryListCourt().contains('Aberdare County Court')
    changeVideoLinkPage.form.date().should('have.value', tomorrow.format('DD/MM/YYYY'))
    changeVideoLinkPage.form.startTimeHours().should('have.value', '11')
    changeVideoLinkPage.form.startTimeMinutes().should('have.value', '00')
    changeVideoLinkPage.form.endTimeHours().should('have.value', '11')
    changeVideoLinkPage.form.endTimeMinutes().should('have.value', '30')
    changeVideoLinkPage.form.preAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.postAppointmentRequiredYes().should('be.checked').and('have.value', 'true')
    changeVideoLinkPage.form.preLocation().should('have.value', '100')
    changeVideoLinkPage.form.mainLocation().should('have.value', '110')
    changeVideoLinkPage.form.postLocation().should('have.value', '120')
  })

  it('A user will be navigated back to the booking-details page', () => {
    ChangeVideoLinkPage.goTo(10)
    const changeVideoLinkPage = ChangeVideoLinkPage.verifyOnPage()
    changeVideoLinkPage.form.cancel().click()
    BookingDetailsPage.verifyOnPage('John Doe’s')
  })
})

const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const PrisonerSearchPage = require('../../pages/createBooking/prisonerSearchPage')
const StartPage = require('../../pages/createBooking/startPage')
const SelectCourtPage = require('../../pages/createBooking/selectCourtPage')
const SelectRoomsPage = require('../../pages/createBooking/selectRoomsPage')
const ConfirmationPage = require('../../pages/createBooking/confirmationPage')
const NoAvailabilityPage = require('../../pages/createBooking/noAvailabilityPage')
const NoLongerAvailablePage = require('../../pages/createBooking/noLongerAvailablePage')

context('A user can add a video link', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubCreateVideoLinkBooking')
    cy.task('stubAgencyDetails', {
      agencyId: 'MDI',
      details: { agencyId: 'MDI', description: 'Moorland', agencyType: 'INST' },
    })
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')
    cy.task('stubOffenderBooking', {
      bookingId: 1,
      response: {
        bookingId: 789,
        firstName: 'john',
        lastName: 'doe',
        offenderNo: 'A1234AA',
      },
    })
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VIDE',
          description: 'Room 1',
          userDescription: 'Room 1',
          agencyId: 'MDI',
        },
        {
          locationId: 2,
          locationType: 'VIDE',
          description: 'Room 2',
          userDescription: 'Room 2',
          agencyId: 'MDI',
        },
        {
          locationId: 3,
          locationType: 'VIDE',
          description: 'Room 3',
          userDescription: 'Room 3',
          agencyId: 'MDI',
        },
      ],
    })
  })

  it('A user with a single preferred court creates a booking for a pre, main and post appointment', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 1, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 3, description: 'Room 3', locationType: 'VIDE' }],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    selectCourtPage.offenderName().contains('John Smith')
    selectCourtPage.prison().contains('Moorland')
    selectCourtPage.startTime().contains('11:00')
    selectCourtPage.endTime().contains('11:30')
    selectCourtPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    selectCourtPage.preTime().contains('10:45 to 11:00')
    selectCourtPage.postTime().contains('11:30 to 11:45')

    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().contains('Aberdare County Court')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        vlbIdsToExclude: [],
        preInterval: { start: '10:45', end: '11:00' },
        mainInterval: { start: '11:00', end: '11:30' },
        postInterval: { start: '11:30', end: '11:45' },
      })
    })
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'MDI',
      bookingId: 1,
      comment: 'A comment',
      courtId: 'ABDRCT',
      videoLinkBookingId: 123,
      pre: {
        locationId: 1,
        startTime: moment().add(1, 'days').set({ hour: 10, minute: 45 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 0 }),
      },
      main: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 0 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 30 }),
      },
      post: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 30 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 45 }),
      },
    })

    selectRoomsForm.submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('11:00')
    confirmationPage.endTime().contains('11:30')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().contains('10:45 to 11:00')
    confirmationPage.legalBriefingAfter().contains('11:30 to 11:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')

    cy.task('getBookingRequest').then(request => {
      expect(request).to.deep.equal({
        bookingId: 14,
        courtId: 'ABDRCT',
        madeByTheCourt: true,
        pre: {
          locationId: 1,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T10:45:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:00:00]`),
        },
        main: {
          locationId: 2,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:00:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:30:00]`),
        },
        post: {
          locationId: 3,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:30:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:45:00]`),
        },
      })
    })
  })

  it('A user with multiple preferred courts creates a booking for a pre, main and post appointment', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 1, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 3, description: 'Room 3', locationType: 'VIDE' }],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    selectCourtPage.offenderName().contains('John Smith')
    selectCourtPage.prison().contains('Moorland')
    selectCourtPage.startTime().contains('11:00')
    selectCourtPage.endTime().contains('11:30')
    selectCourtPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    selectCourtPage.preTime().contains('10:45 to 11:00')
    selectCourtPage.postTime().contains('11:30 to 11:45')

    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().select('ABDRCT')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        vlbIdsToExclude: [],
        preInterval: { start: '10:45', end: '11:00' },
        mainInterval: { start: '11:00', end: '11:30' },
        postInterval: { start: '11:30', end: '11:45' },
      })
    })
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'MDI',
      bookingId: 1,
      comment: 'A comment',
      courtId: 'ABDRCT',
      videoLinkBookingId: 123,
      pre: {
        locationId: 1,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 0 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 15 }),
      },
      main: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 15 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 45 }),
      },
      post: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 45 }),
        endTime: moment().add(1, 'days').set({ hour: 12, minute: 0 }),
      },
    })

    selectRoomsForm.submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('11:15')
    confirmationPage.endTime().contains('11:45')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().contains('11:00 to 11:15')
    confirmationPage.legalBriefingAfter().contains('11:45 to 12:00')
    confirmationPage.courtLocation().contains('Aberdare County Court')

    cy.task('getBookingRequest').then(request => {
      expect(request).to.deep.equal({
        bookingId: 14,
        courtId: 'ABDRCT',
        madeByTheCourt: true,
        pre: {
          locationId: 1,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T10:45:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:00:00]`),
        },
        main: {
          locationId: 2,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:00:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:30:00]`),
        },
        post: {
          locationId: 3,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:30:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:45:00]`),
        },
      })
    })
  })

  it('A user creates a booking for only a main appointment', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubRoomAvailability', {
      pre: [],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredNo().click()
    addAppointmentForm.postAppointmentRequiredNo().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    selectCourtPage.offenderName().contains('John Smith')
    selectCourtPage.prison().contains('Moorland')
    selectCourtPage.startTime().contains('11:00')
    selectCourtPage.endTime().contains('11:30')
    selectCourtPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    selectCourtPage.preTime().should('not.exist')
    selectCourtPage.postTime().should('not.exist')

    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().contains('Aberdare County Court')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    cy.task('getFindAvailabilityRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        vlbIdsToExclude: [],
        preInterval: null,
        mainInterval: { start: '11:00', end: '11:30' },
        postInterval: null,
      })
    })
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectMainAppointmentLocation().select('2')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'MDI',
      bookingId: 1,
      comment: 'A comment',
      courtId: 'ABDRCT',
      videoLinkBookingId: 123,
      main: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 0 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 30 }),
      },
    })
    selectRoomsForm.submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('11:00')
    confirmationPage.endTime().contains('11:30')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().should('not.exist')
    confirmationPage.legalBriefingAfter().should('not.exist')
    confirmationPage.courtLocation().contains('Aberdare County Court')

    cy.task('getBookingRequest').then(request => {
      expect(request).to.deep.equal({
        bookingId: 14,
        courtId: 'ABDRCT',
        madeByTheCourt: true,
        main: {
          locationId: 2,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:00:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:30:00]`),
        },
      })
    })
  })

  it('Pages are protected when cookie is absent', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
    cy.task('stubRoomAvailability', {
      pre: [],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredNo().click()
    addAppointmentForm.postAppointmentRequiredNo().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().contains('Aberdare County Court')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectMainAppointmentLocation().select('2')

    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'MDI',
      bookingId: 1,
      comment: 'A comment',
      courtId: 'ABDRCT',
      videoLinkBookingId: 123,
      main: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 0 }),
        endTime: moment().add(1, 'days').set({ hour: 11, minute: 30 }),
      },
    })
    selectRoomsForm.submitButton().click()

    ConfirmationPage.verifyOnPage()

    cy.go('back')

    PrisonerSearchPage.verifyOnPage()

    cy.visit(SelectCourtPage.url('WWI', 'A1234AA'))

    PrisonerSearchPage.verifyOnPage()

    cy.visit(SelectRoomsPage.url('WWI', 'A1234AA'))

    PrisonerSearchPage.verifyOnPage()
  })

  it('A user is redirected to no availability for time page', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VIDE',
          description: 'Room 1',
          userDescription: 'Room 1',
          agencyId: 'MDI',
        },
        {
          locationId: 2,
          locationType: 'VIDE',
          description: 'Room 2',
          userDescription: 'Room 2',
          agencyId: 'MDI',
        },
      ],
    })
    const tomorrow = moment().add(1, 'days')

    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 1, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(tomorrow.format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const noAvailabilityPage = NoAvailabilityPage.verifyOnPage()
    noAvailabilityPage
      .info()
      .contains(`There are no bookings available on ${tomorrow.format('dddd D MMMM YYYY')} between 10:45 and 11:45.`)
  })

  it('User selects rooms but they become unavailable before confirmation', () => {
    // This is a bit of a cheat, as we only check the user role.
    // Saves dealing with logging out and logging back in in the setup.
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 1, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 3, description: 'Room 3', locationType: 'VIDE' }],
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('11')
    addAppointmentForm.startTimeMinutes().select('00')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('30')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().contains('Aberdare County Court')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')

    cy.task('stubRoomAvailability', {
      pre: [{ locationId: 1, description: 'Room 1', locationType: 'VIDE' }],
      main: [{ locationId: 2, description: 'Room 2', locationType: 'VIDE' }],
      post: [{ locationId: 4, description: 'Room 4', locationType: 'VIDE' }],
    })

    selectRoomsForm.submitButton().click()

    const noLongerAvailablePage = NoLongerAvailablePage.verifyOnPage()
    noLongerAvailablePage.continue().click()

    SelectRoomsPage.verifyOnPage()
  })
})

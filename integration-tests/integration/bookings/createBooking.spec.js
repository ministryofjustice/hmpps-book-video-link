const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const PrisonerSearchPage = require('../../pages/createBooking/prisonerSearchPage')
const NewBookingPage = require('../../pages/createBooking/newBookingPage')
const ConfirmBookingPage = require('../../pages/createBooking/confirmBookingPage')
const ConfirmationPage = require('../../pages/createBooking/confirmationPage')
const NotAvailablePage = require('../../pages/createBooking/notAvailablePage')
const NoLongerAvailablePage = require('../../pages/createBooking/noLongerAvailablePage')

const allRooms = [
  { locationId: 1, description: 'Room 1', locationType: 'VIDE' },
  { locationId: 2, description: 'Room 2', locationType: 'VIDE' },
  { locationId: 3, description: 'Room 3', locationType: 'VIDE' },
]

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
    cy.task('stubUserEmail', 'COURT_USER')
    cy.task('stubUser', 'COURT_USER', 'WWI')
    cy.task('stubOffenderBooking', {
      bookingId: 1,
      response: {
        bookingId: 789,
        firstName: 'john',
        lastName: 'doe',
        offenderNo: 'A1234AA',
      },
    })

    cy.task('stubGetRooms', {
      agencyId: 'MDI',
      rooms: [
        { locationId: 1, description: 'Room 1', locationType: 'VIDE' },
        { locationId: 2, description: 'Room 2', locationType: 'VIDE' },
        { locationId: 3, description: 'Room 3', locationType: 'VIDE' },
      ],
    })

    cy.task('stubCourtEmailAddress', { courtId: 'ABDRCT' })
  })

  it('A user with a single preferred court creates a booking for a pre, main and post appointment', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.court().contains('Aberdare County Court')
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredYes().click()
    newBookingForm.postAppointmentRequiredYes().click()
    newBookingForm.selectPreAppointmentLocation().select('1')
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.selectPostAppointmentLocation().select('3')

    cy.task('stubAvailabilityCheck', { matched: true })

    newBookingForm.submitButton().click()

    const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
    confirmBookingPage.offenderName().contains('John Smith')
    confirmBookingPage.prison().contains('Moorland')
    confirmBookingPage.startTime().contains('11:00')
    confirmBookingPage.endTime().contains('11:30')
    confirmBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmBookingPage.preTime().contains('10:45 to 11:00')
    confirmBookingPage.postTime().contains('11:30 to 11:45')
    confirmBookingPage.preRoom().contains('Room 1')
    confirmBookingPage.postRoom().contains('Room 3')
    confirmBookingPage.mainRoom().contains('Room 2')
    confirmBookingPage.court().contains('Aberdare County Court')

    cy.task('getAvailabilityCheckRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        preAppointment: {
          interval: { start: '10:45', end: '11:00' },
          locationId: 1,
        },
        mainAppointment: {
          interval: { start: '11:00', end: '11:30' },
          locationId: 2,
        },
        postAppointment: {
          interval: { start: '11:30', end: '11:45' },
          locationId: 3,
        },
      })
    })

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

    confirmBookingPage.form().submitButton().click()

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
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAvailabilityCheck', { matched: true })

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    newBookingForm.court().select('ABDRCT')
    newBookingPage.activeDate().click()
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredYes().click()
    newBookingForm.postAppointmentRequiredYes().click()
    newBookingForm.selectPreAppointmentLocation().select('1')
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.selectPostAppointmentLocation().select('3')
    newBookingForm.submitButton().click()

    const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
    confirmBookingPage.offenderName().contains('John Smith')
    confirmBookingPage.prison().contains('Moorland')
    confirmBookingPage.startTime().contains('11:00')
    confirmBookingPage.endTime().contains('11:30')
    confirmBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmBookingPage.preTime().contains('10:45 to 11:00')
    confirmBookingPage.postTime().contains('11:30 to 11:45')

    cy.task('getAvailabilityCheckRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        preAppointment: {
          interval: { start: '10:45', end: '11:00' },
          locationId: 1,
        },
        mainAppointment: {
          interval: { start: '11:00', end: '11:30' },
          locationId: 2,
        },
        postAppointment: {
          interval: { start: '11:30', end: '11:45' },
          locationId: 3,
        },
      })
    })

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

    confirmBookingPage.form().submitButton().click()

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
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAvailabilityCheck', { matched: true })

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.court().contains('Aberdare County Court')
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredNo().click()
    newBookingForm.postAppointmentRequiredNo().click()
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.submitButton().click()

    const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
    confirmBookingPage.offenderName().contains('John Smith')
    confirmBookingPage.prison().contains('Moorland')
    confirmBookingPage.startTime().contains('11:00')
    confirmBookingPage.endTime().contains('11:30')
    confirmBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmBookingPage.preTime().should('not.exist')
    confirmBookingPage.postTime().should('not.exist')

    cy.task('getAvailabilityCheckRequests').then(request => {
      expect(request[0]).to.deep.equal({
        agencyId: 'MDI',
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
        mainAppointment: {
          interval: { start: '11:00', end: '11:30' },
          locationId: 2,
        },
      })
    })

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

    confirmBookingPage.form().submitButton().click()

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
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
    cy.task('stubAvailabilityCheck', { matched: true })

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.selectMainAppointmentLocation().select('2')

    newBookingForm.preAppointmentRequiredNo().click()
    newBookingForm.postAppointmentRequiredNo().click()
    newBookingForm.submitButton().click()

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

    ConfirmBookingPage.verifyOnPage().form().submitButton().click()

    ConfirmationPage.verifyOnPage()

    cy.go('back')

    PrisonerSearchPage.verifyOnPage()

    cy.visit(ConfirmBookingPage.url('WWI', 'A1234AA'))

    PrisonerSearchPage.verifyOnPage()
  })

  it('A user is redirected when no availability', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)

    cy.task('stubAvailabilityCheck', { matched: false, alternatives: [] })
    const tomorrow = moment().add(1, 'days')

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(tomorrow.format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredYes().click()
    newBookingForm.postAppointmentRequiredYes().click()
    newBookingForm.selectPreAppointmentLocation().select('1')
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.selectPostAppointmentLocation().select('3')
    newBookingForm.submitButton().click()

    const notAvailablePage = NotAvailablePage.verifyOnPage()
    notAvailablePage.info().contains(`There are no video link bookings available at that time in the rooms selected.`)
    notAvailablePage.details().click()
    notAvailablePage.detailsSummaryText().contains(`What to do if you can't find a booking`)
    notAvailablePage.detailsTextFirst().contains(`You should contact the prison you're trying to book a room in.`)
    notAvailablePage.detailsTextSecond().contains(`They may be able to find an alternative room for your booking.`)
  })

  it('A user is redirected when option not available and then chooses alternative', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)

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

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(tomorrow.format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredYes().click()
    newBookingForm.postAppointmentRequiredYes().click()
    newBookingForm.selectPreAppointmentLocation().select('1')
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.selectPostAppointmentLocation().select('3')
    newBookingForm.submitButton().click()

    const notAvailablePage = NotAvailablePage.verifyOnPage()
    notAvailablePage.info().contains(`There are no video link bookings available at that time in the rooms selected.`)
    notAvailablePage.details().click()
    notAvailablePage.detailsSummaryText().contains(`What to do if you can't find a booking`)
    notAvailablePage.detailsTextFirst().contains(`You should contact the prison you're trying to book a room in.`)
    notAvailablePage.detailsTextSecond().contains(`They may be able to find an alternative room for your booking.`)
    notAvailablePage.selectAlternative(1)

    const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
    confirmBookingPage.offenderName().contains('John Smith')
    confirmBookingPage.prison().contains('Moorland')
    confirmBookingPage.startTime().contains('12:00')
    confirmBookingPage.endTime().contains('12:30')
    confirmBookingPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmBookingPage.preTime().contains('11:45 to 12:00')
    confirmBookingPage.postTime().contains('12:30 to 12:45')
    cy.task('stubAvailabilityCheck', { matched: true, alternatives: [] })
    cy.task('stubGetVideoLinkBooking', {
      agencyId: 'MDI',
      bookingId: 1,
      comment: 'A comment',
      courtId: 'ABDRCT',
      videoLinkBookingId: 123,
      pre: {
        locationId: 1,
        startTime: moment().add(1, 'days').set({ hour: 11, minute: 45 }),
        endTime: moment().add(1, 'days').set({ hour: 12, minute: 0 }),
      },
      main: {
        locationId: 2,
        startTime: moment().add(1, 'days').set({ hour: 12, minute: 0 }),
        endTime: moment().add(1, 'days').set({ hour: 12, minute: 30 }),
      },
      post: {
        locationId: 3,
        startTime: moment().add(1, 'days').set({ hour: 12, minute: 30 }),
        endTime: moment().add(1, 'days').set({ hour: 12, minute: 45 }),
      },
    })
    confirmBookingPage.form().submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('12:00')
    confirmationPage.endTime().contains('12:30')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().contains('Room 1 - 11:45 to 12:00')
    confirmationPage.legalBriefingAfter().contains('Room 3 - 12:30 to 12:45')
    confirmationPage.courtLocation().contains('Aberdare County Court')
  })

  it('A user with decides to change their appointment', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    cy.login()
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAvailabilityCheck', { matched: true })

    {
      const newBookingPage = NewBookingPage.verifyOnPage()
      const newBookingForm = newBookingPage.form()
      newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

      newBookingForm.court().select('ABDRCT')
      newBookingPage.activeDate().click()
      newBookingForm.startTimeHours().select('11')
      newBookingForm.startTimeMinutes().select('00')
      newBookingForm.endTimeHours().select('11')
      newBookingForm.endTimeMinutes().select('30')
      newBookingForm.preAppointmentRequiredYes().click()
      newBookingForm.postAppointmentRequiredYes().click()
      newBookingForm.selectPreAppointmentLocation().select('1')
      newBookingForm.selectMainAppointmentLocation().select('2')
      newBookingForm.selectPostAppointmentLocation().select('3')
      newBookingForm.submitButton().click()
    }

    {
      const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
      confirmBookingPage.changeBooking().click()
    }

    {
      const newBookingPage = NewBookingPage.verifyOnPage()
      const newBookingForm = newBookingPage.form()
      newBookingForm.date().should('have.value', moment().add(1, 'days').format('DD/MM/YYYY'))
      newBookingForm.court().should('have.value', 'ABDRCT')
      newBookingForm.startTimeHours().contains('11')
      newBookingForm.startTimeMinutes().contains('00')
      newBookingForm.endTimeHours().contains('11')
      newBookingForm.endTimeMinutes().contains('30')
      newBookingForm.selectPreAppointmentLocation().should('have.value', '1')
      newBookingForm.selectMainAppointmentLocation().should('have.value', '2')
      newBookingForm.selectPostAppointmentLocation().should('have.value', '3')

      newBookingForm.endTimeMinutes().select('45')
      newBookingForm.postAppointmentRequiredNo().click()

      newBookingForm.submitButton().click()
    }

    {
      const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
      confirmBookingPage.endTime().contains('11:45')
      confirmBookingPage.preTime().should('exist')
      confirmBookingPage.postTime().should('not.exist')

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
          endTime: moment().add(1, 'days').set({ hour: 11, minute: 45 }),
        },
      })

      confirmBookingPage.form().submitButton().click()
    }

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Doe')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('11:00')
    confirmationPage.endTime().contains('11:45')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().contains('10:45 to 11:00')
    confirmationPage.legalBriefingAfter().should('not.exist')
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
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:45:00]`),
        },
      })
    })
  })

  it('User selects rooms but they become unavailable before confirmation', () => {
    // This is a bit of a cheat, as we only check the user role.
    // Saves dealing with logging out and logging back in in the setup.
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', {})
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.task('stubAvailabilityCheck', { matched: true, alternatives: [] })
    cy.login()
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)

    const newBookingPage = NewBookingPage.verifyOnPage()
    const newBookingForm = newBookingPage.form()
    newBookingForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    newBookingPage.activeDate().click()
    newBookingForm.startTimeHours().select('11')
    newBookingForm.startTimeMinutes().select('00')
    newBookingForm.endTimeHours().select('11')
    newBookingForm.endTimeMinutes().select('30')
    newBookingForm.preAppointmentRequiredYes().click()
    newBookingForm.postAppointmentRequiredYes().click()
    newBookingForm.selectPreAppointmentLocation().select('1')
    newBookingForm.selectMainAppointmentLocation().select('2')
    newBookingForm.selectPostAppointmentLocation().select('3')
    newBookingForm.submitButton().click()

    const confirmBookingPage = ConfirmBookingPage.verifyOnPage()
    cy.task('stubAvailabilityCheck', { matched: false, alternatives: [] })
    confirmBookingPage.form().submitButton().click()

    const noLongerAvailablePage = NoLongerAvailablePage.verifyOnPage()
    noLongerAvailablePage.continue().click()

    {
      const newBookingPage = NewBookingPage.verifyOnPage()
      const newBookingForm = newBookingPage.form()
      newBookingForm.date().should('have.value', moment().add(1, 'days').format('DD/MM/YYYY'))
      newBookingForm.startTimeHours().contains('11')
      newBookingForm.startTimeMinutes().contains('00')
      newBookingForm.endTimeHours().contains('11')
      newBookingForm.endTimeMinutes().contains('30')
      newBookingForm.selectPreAppointmentLocation().should('have.value', '1')
      newBookingForm.selectMainAppointmentLocation().should('have.value', '2')
      newBookingForm.selectPostAppointmentLocation().should('have.value', '3')
    }
  })

  it('A user will be navigated back to the prisoner search page', () => {
    const offenderNo = 'A12345'
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })
    cy.login()
    cy.task('stubGetRooms', { agencyId: 'MDI', rooms: allRooms })
    cy.visit(`/MDI/offenders/${offenderNo}/new-court-appointment`)
    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    const newBookingPage = NewBookingPage.verifyOnPage()
    newBookingPage.returnToPrisonerSearch().click()
    PrisonerSearchPage.verifyOnPage()
  })
})

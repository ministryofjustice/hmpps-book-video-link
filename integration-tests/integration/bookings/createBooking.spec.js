const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const StartPage = require('../../pages/createBooking/startPage')
const SelectCourtPage = require('../../pages/createBooking/selectCourtPage')
const SelectRoomsPage = require('../../pages/createBooking/selectRoomsPage')
const ConfirmationPage = require('../../pages/createBooking/confirmationPage')
const NoAvailabilityPage = require('../../pages/createBooking/noAvailabilityPage')

context('A user can add a video link', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    const offenderNo = 'A12345'
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubCourts')
    cy.task('stubCreateVideoLinkBooking')
    cy.task('stubAgencyDetails', {
      agencyId: 'MDI',
      details: { agencyId: 'MDI', description: 'Moorland', agencyType: 'INST' },
    })
    cy.task('stubUserEmail', 'ITAG_USER')
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

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: '2017-10-15T15:30:00',
          locationId: 1,
        },
      ],
      location: 1,
      date: moment().add(1, 'days').format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: '2017-10-15T15:30:00',
          locationId: 2,
        },
      ],
      location: 2,
      date: moment().add(1, 'days').format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: '2017-10-15T15:30:00',
          locationId: 3,
        },
      ],
      location: 3,
      date: moment().add(1, 'days').format('yyyy-MM-DD'),
    })

    cy.visit(`/MDI/offenders/${offenderNo}/add-court-appointment`)
  })

  it('A user is taken to select court and rooms pages and then to court video link confirm', () => {
    // This is a bit of a cheat, as we only check the user role.
    // Saves dealing with logging out and logging back in in the setup.
    cy.task('stubLoginCourt')
    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    selectCourtPage.offenderName().contains('John Smith')
    selectCourtPage.prison().contains('Moorland')
    selectCourtPage.startTime().contains('10:55')
    selectCourtPage.endTime().contains('11:55')
    selectCourtPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    selectCourtPage.preTime().contains('10:35 to 10:55')
    selectCourtPage.postTime().contains('11:55 to 12:15')

    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.court().select('London')
    selectCourtForm.submitButton().click()

    const selectRoomsPage = SelectRoomsPage.verifyOnPage()
    const selectRoomsForm = selectRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')
    selectRoomsForm.submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.offenderName().contains('John Smith')
    confirmationPage.prison().contains('Moorland')
    confirmationPage.room().contains('Room 2')
    confirmationPage.startTime().contains('10:55')
    confirmationPage.endTime().contains('11:55')
    confirmationPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    confirmationPage.legalBriefingBefore().contains('10:35 to 10:55')
    confirmationPage.legalBriefingAfter().contains('11:55 to 12:15')
    confirmationPage.courtLocation().contains('London')

    cy.task('getBookingRequest').then(request => {
      expect(request).to.deep.equal({
        bookingId: 14,
        court: 'London',
        madeByTheCourt: true,
        pre: {
          locationId: 1,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T10:35:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T10:55:00]`),
        },
        main: {
          locationId: 2,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T10:55:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:55:00]`),
        },
        post: {
          locationId: 3,
          startTime: moment().add(1, 'days').format(`YYYY-MM-DD[T11:55:00]`),
          endTime: moment().add(1, 'days').format(`YYYY-MM-DD[T12:15:00]`),
        },
      })
    })
  })

  it('A user is redirected to no availability for today page', () => {
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
    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo: 'A12345',
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: tomorrow.hours(8).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow.hours(18).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 1,
        },
      ],
      location: 1,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo: 'A12345',
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: tomorrow.hours(8).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow.hours(18).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 2,
        },
      ],
      location: 2,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(tomorrow.format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const noAvailabilityPage = NoAvailabilityPage.verifyOnPage()
    noAvailabilityPage.info().contains(`There are no bookings available on ${tomorrow.format('dddd D MMMM YYYY')}`)
  })

  it('A user is redirected to no availability for time page', () => {
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
    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo: 'A12345',
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: tomorrow.hours(8).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow.hours(15).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 1,
        },
      ],
      location: 1,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
      appointments: [
        {
          offenderNo: 'A12345',
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: tomorrow.hours(8).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow.hours(15).minutes(0).format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 2,
        },
      ],
      location: 2,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    const startPage = StartPage.verifyOnPage()
    const addAppointmentForm = startPage.form()
    addAppointmentForm.date().type(tomorrow.format('DD/MM/YYYY'))

    startPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const noAvailabilityPage = NoAvailabilityPage.verifyOnPage()
    noAvailabilityPage
      .info()
      .contains(`There are no bookings available on ${tomorrow.format('dddd D MMMM YYYY')} between 10:35 and 12:15.`)
  })
})

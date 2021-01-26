const moment = require('moment')
const BookingDetailsPage = require('../../../pages/viewBookings/bookingDetailsPage')
const CourtVideoLinkBookingsPage = require('../../../pages/viewBookings/courtVideoBookingsPage')
const ChangeCommentsPage = require('../../../pages/amendBooking/changeCommentsPage')
const CommentsConfirmationPage = require('../../../pages/amendBooking/commentsConfirmationPage')

context('A user can update a booking comment', () => {
  const stubBookingDetailsWithComment = comment => {
    return cy.task('stubGetVideoLinkBooking', {
      agencyId: 'WWI',
      bookingId: 1,
      comment,
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
  }

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

    cy.task('stubUpdateVideoLinkBookingComment', 10)

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

    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
  })

  it('A user successfully amends a booking comment', () => {
    cy.task('stubLoginCourt')
    stubBookingDetailsWithComment('A comment')
    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeComment().contains('Change comment')
    bookingDetailsPage.changeComment().click()

    const changeCommentsPage = ChangeCommentsPage.verifyOnPage({ commentExists: true })
    const changeCommentsForm = changeCommentsPage.form()
    changeCommentsForm.comments().contains('A comment')
    changeCommentsForm.comments().type(' is updated')
    stubBookingDetailsWithComment('A comment is updated')
    changeCommentsPage.continue().click()

    const commentsConfirmationPage = CommentsConfirmationPage.verifyOnPage()
    commentsConfirmationPage.offenderName().contains('John Doe')
    commentsConfirmationPage.prison().contains('Wandsworth')
    commentsConfirmationPage.room().contains('Room 2')
    commentsConfirmationPage.date().contains('2 January 2020')
    commentsConfirmationPage.startTime().contains('13:00')
    commentsConfirmationPage.endTime().contains('13:30')
    commentsConfirmationPage.comments().contains('A comment is updated')
    commentsConfirmationPage.legalBriefingBefore().contains('Room 1 - 12:40 to 13:00')
    commentsConfirmationPage.legalBriefingAfter().contains('Room 3 - 13:30 to 13:50')
    commentsConfirmationPage.courtLocation().contains('Leeds')
    commentsConfirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
    cy.task('getUpdateCommentRequest').then(request => {
      expect(request).to.deep.equal('A comment is updated')
    })
  })

  it('A user successfully adds a booking comment', () => {
    cy.task('stubLoginCourt')
    stubBookingDetailsWithComment(null)

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeComment().contains('Add comment')
    bookingDetailsPage.changeComment().click()

    const changeCommentsPage = ChangeCommentsPage.verifyOnPage({ commentExists: false })
    const changeCommentsForm = changeCommentsPage.form()
    changeCommentsForm.comments().type('A new comment')
    stubBookingDetailsWithComment('A new comment')
    changeCommentsPage.continue().click()

    const commentsConfirmationPage = CommentsConfirmationPage.verifyOnPage()
    commentsConfirmationPage.offenderName().contains('John Doe')
    commentsConfirmationPage.prison().contains('Wandsworth')
    commentsConfirmationPage.room().contains('Room 2')
    commentsConfirmationPage.date().contains('2 January 2020')
    commentsConfirmationPage.startTime().contains('13:00')
    commentsConfirmationPage.endTime().contains('13:30')
    commentsConfirmationPage.comments().contains('A new comment')
    commentsConfirmationPage.legalBriefingBefore().contains('Room 1 - 12:40 to 13:00')
    commentsConfirmationPage.legalBriefingAfter().contains('Room 3 - 13:30 to 13:50')
    commentsConfirmationPage.courtLocation().contains('Leeds')
    commentsConfirmationPage.exitToAllBookings().click()

    CourtVideoLinkBookingsPage.verifyOnPage()
    cy.task('getUpdateCommentRequest').then(request => {
      expect(request).to.deep.equal('A new comment')
    })
  })

  it('A user will be shown a validation message when a comment exceeds 3600 characters', () => {
    cy.task('stubLoginCourt')
    stubBookingDetailsWithComment('#'.repeat(3601))

    const bookingDetailsPage = BookingDetailsPage.goTo(10, 'John Doe’s')
    bookingDetailsPage.changeComment().click()

    const changeCommentsPage = ChangeCommentsPage.verifyOnPage({ commentExists: true })
    const changeCommentsForm = changeCommentsPage.form()
    changeCommentsForm.comments().contains('#'.repeat(3601))
    changeCommentsPage.continue().click()

    ChangeCommentsPage.verifyOnPage({ commentExists: true })
    changeCommentsForm.comments().should('have.value', '#'.repeat(3601))
    changeCommentsPage.errorSummaryTitle().contains('There is a problem')
    changeCommentsPage.errorSummaryBody().contains('Maximum length should not exceed 3600 characters')
    changeCommentsForm.inlineError().contains('Maximum length should not exceed 3600 characters')
  })
})

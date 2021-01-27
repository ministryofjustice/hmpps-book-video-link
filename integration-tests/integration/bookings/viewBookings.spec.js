const moment = require('moment')
const CourtVideoLinkBookingsPage = require('../../pages/viewBookings/courtVideoBookingsPage')

context('A user can view the video link home page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLoginCourt')
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubCourts')
    cy.task('stubAgencies', [{ agencyId: 'WWI', formattedDescription: 'HMP Wandsworth' }])
    cy.task('stubOffenderBookings', [
      { bookingId: 1, firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: 2, firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubGetVideoLinkBookings', {
      agencyId: '.*?',
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
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

    cy.task('stubAppointmentLocations', {
      agency: '.*?',
      locations: [],
    })
    cy.task('stubAppointmentLocations', {
      agency: 'WWI',
      locations: [
        { locationId: 100, userDescription: 'Room 1', agencyId: 'WWI' },
        { locationId: 110, userDescription: 'Room 2', agencyId: 'WWI' },
        { locationId: 120, userDescription: 'Room 3', agencyId: 'WWI' },
      ],
    })
  })

  it('The results are displayed', () => {
    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.noResultsMessage().should('not.exist')
    courtVideoBookingsPage.getRows().should('have.length', 5)
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(0)
      time().contains('12:40 to 13:00')
      prisoner().contains('Offender One')
      location().contains('Room 1')
      location().contains('in: HMP Wandsworth')
      court().contains('Leeds')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(1)
      time().contains('13:00 to 13:30')
      prisoner().contains('Offender One')
      location().contains('Room 2')
      location().contains('in: HMP Wandsworth')
      court().contains('Leeds')
      type().contains('Court hearing')
      action().contains('Change')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(2)
      time().contains('13:30 to 13:50')
      prisoner().contains('Offender One')
      location().contains('Room 3')
      location().contains('in: HMP Wandsworth')
      court().contains('Leeds')
      type().contains('Post-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(3)
      time().contains('14:40 to 15:00')
      prisoner().contains('Offender Two')
      location().contains('Room 1')
      location().contains('in: HMP Wandsworth')
      court().contains('Other court')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(4)
      time().contains('15:00 to 15:30')
      prisoner().contains('Offender Two')
      location().contains('Room 2')
      location().contains('in: HMP Wandsworth')
      court().contains('Other court')
      type().contains('Court hearing')
      action().contains('Change')
    }
  })

  it('Has correct date format and returns unsupported courts when Other is selected', () => {
    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.dateInput().should('have.value', moment().format('D MMMM YYYY'))
    courtVideoBookingsPage.courtOption().select('Other')
    courtVideoBookingsPage.submitButton().click()

    courtVideoBookingsPage.getRows().should('have.length', 2)
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(0)
      time().contains('14:40 to 15:00')
      prisoner().contains('Offender Two')
      location().contains('Room 1')
      court().contains('Other court')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(1)
      time().contains('15:00 to 15:30')
      prisoner().contains('Offender Two')
      location().contains('Room 2')
      court().contains('Other court')
      type().contains('Court hearing')
      action().contains('Change')
    }
  })

  it('The no results message is displayed', () => {
    cy.task('stubGetVideoLinkBookings', {
      agencyId: 'WWI',
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })
    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.noResultsMessage().should('be.visible')
  })
})

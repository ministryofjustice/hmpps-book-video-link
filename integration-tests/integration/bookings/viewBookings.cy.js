const moment = require('moment')
const CourtVideoLinkBookingsPage = require('../../pages/viewBookings/courtVideoBookingsPage')

context('A user can view the video link home page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubAgencies', [{ agencyId: 'WWI', formattedDescription: 'HMP Wandsworth' }])
    cy.task('stubFindPrisonersByBookingIds', [
      { bookingId: 1, firstName: 'OFFENDER', lastName: 'ONE' },
      { bookingId: 2, firstName: 'OFFENDER', lastName: 'TWO' },
    ])

    cy.task('stubFindVideoLinkBookings', {
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
  })

  it('The results are displayed', () => {
    cy.task('stubLoginCourt', {})
    cy.login()

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
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
          court: 'Aberdare County Court',
          courtId: 'ABDRCT',
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
      court().contains('Aberdare County Court')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(1)
      time().contains('13:00 to 13:30')
      prisoner().contains('Offender One')
      location().contains('Room 2')
      location().contains('in: HMP Wandsworth')
      court().contains('Aberdare County Court')
      type().contains('Court hearing')
      action().contains('View or edit')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(2)
      time().contains('13:30 to 13:50')
      prisoner().contains('Offender One')
      location().contains('Room 3')
      location().contains('in: HMP Wandsworth')
      court().contains('Aberdare County Court')
      type().contains('Post-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(3)
      time().contains('14:40 to 15:00')
      prisoner().contains('Offender Two')
      location().contains('Room 1')
      location().contains('in: HMP Wandsworth')
      court().contains('Aberdare County Court')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(4)
      time().contains('15:00 to 15:30')
      prisoner().contains('Offender Two')
      location().contains('Room 2')
      location().contains('in: HMP Wandsworth')
      court().contains('Aberdare County Court')
      type().contains('Court hearing')
      action().contains('View or edit')
    }
  })

  it('Has correct date format, defaults to first court, and allows selecting other court', () => {
    cy.task('stubLoginCourt', { preferredCourts: ['ABDRCT', 'BANBCT'] })

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [
        {
          agencyId: 'WWI',
          bookingId: 2,
          comment: 'A comment',
          court: 'Aberdare County Court',
          courtId: 'ABDRCT',
          videoLinkBookingId: 11,
          main: {
            locationId: 110,
            startTime: '2020-01-02T15:00:00',
            endTime: '2020-01-02T15:30:00',
          },
        },
      ],
    })

    cy.login()

    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.getRows().should('have.length', 1)
    {
      const { time, prisoner, location, court, type } = courtVideoBookingsPage.getRow(0)
      time().contains('15:00 to 15:30')
      prisoner().contains('Offender Two')
      location().contains('Room 2')
      court().contains('Aberdare County Court')
      type().contains('Court hearing')
    }
    courtVideoBookingsPage.dateInput().should('have.value', moment().format('D MMMM YYYY'))
    courtVideoBookingsPage.courtOption().select('BANBCT')

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [
        {
          agencyId: 'WWI',
          bookingId: 2,
          comment: 'A comment',
          court: 'Banbury County Court',
          courtId: 'BANBCT',
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
    courtVideoBookingsPage.submitButton().click()

    courtVideoBookingsPage.getRows().should('have.length', 2)
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(0)
      time().contains('14:40 to 15:00')
      prisoner().contains('Offender Two')
      location().contains('Room 1')
      court().contains('Banbury County Court')
      type().contains('Pre-court hearing')
      action().should('not.exist')
    }
    {
      const { time, prisoner, location, court, type, action } = courtVideoBookingsPage.getRow(1)
      time().contains('15:00 to 15:30')
      prisoner().contains('Offender Two')
      location().contains('Room 2')
      court().contains('Banbury County Court')
      type().contains('Court hearing')
      action().contains('View or edit')
    }
  })

  it('The no results message is displayed', () => {
    cy.task('stubLoginCourt', {})
    cy.login()

    cy.task('stubFindVideoLinkBookings', {
      date: moment().format('yyyy-MM-DD'),
      bookings: [],
    })
    cy.visit('/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.noResultsMessage().should('be.visible')
  })
})

import PrisonerSearchPage from '../../pages/createBooking/prisonerSearchPage'

context('A user can search for an offender', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLoginCourt', {})
    cy.login()
    cy.task('stubUserMeRoles', [{ roleCode: 'VIDEO_LINK_COURT_USER' }])
    cy.task('stubUserMe')
    cy.task('stubAgencies', [
      {
        description: 'MOORLAND (HMP & YOI)',
        formattedDescription: 'Moorland (HMP & YOI)',
        agencyId: 'MDI',
        agencyType: 'INST',
      },
      {
        description: 'LEEDS (HMP)',
        formattedDescription: 'Leeds (HMP)',
        agencyId: 'LEI',
        agencyType: 'INST',
      },
      {
        description: 'WANDSWORTH (HMP)',
        formattedDescription: 'Wandsworth (HMP)',
        agencyId: 'WWI',
        agencyType: 'INST',
      },
    ])
  })

  it('should display errors if mandatory fields are empty', () => {
    cy.task('stubPrisonApiGlobalSearch')
    const prisonerSearchPage = PrisonerSearchPage.goTo()
    prisonerSearchPage.search().click()
    prisonerSearchPage
      .errorSummary()
      .contains("You must search using either the prisoner's last name, prison number or PNC Number")
  })

  it('should handle missing dob fields', () => {
    cy.task('stubPrisonApiGlobalSearch')
    let prisonerSearchPage = PrisonerSearchPage.goTo()
    prisonerSearchPage.lastName().type('Offender')

    prisonerSearchPage.day().type('1')
    prisonerSearchPage.search().click()

    prisonerSearchPage = PrisonerSearchPage.verifyOnPage()
    prisonerSearchPage.errorSummary().contains('Date of birth must include a month')
    prisonerSearchPage.errorSummary().contains('Date of birth must include a year')
    prisonerSearchPage.day().clear()
    prisonerSearchPage.month().type('1')
    prisonerSearchPage.year().type('1990')
    prisonerSearchPage.search().click()
    prisonerSearchPage.errorSummary().contains('Date of birth must include a day')
  })

  it('should return search results if name or number entered', () => {
    cy.task('stubPrisonApiGlobalSearch', [
      {
        offenderNo: 'G0011GX',
        firstName: 'TEST',
        middleNames: 'ING',
        lastName: 'OFFENDER',
        dateOfBirth: '1980-07-17',
        latestLocationId: 'WWI',
        latestLocation: 'Wandsworth',
        pncNumber: '1/2345',
      },
    ])

    const prisonerSearchPage = PrisonerSearchPage.goTo()
    prisonerSearchPage.lastName().type('Offender')
    prisonerSearchPage.search().click()
    prisonerSearchPage
      .results()
      .find('td')
      .then($cells => {
        expect($cells.length).to.eq(6)

        expect($cells.get(0)).to.contain('Test Offender')
        expect($cells.get(1)).to.contain('G0011GX')
        expect($cells.get(2)).to.contain('17 July 1980')
        expect($cells.get(3)).to.contain('Wandsworth')
        expect($cells.get(4)).to.contain('1/2345')
        expect($cells.get(5)).to.contain('Book video link')
      })
  })

  it('should display the feedback banner with the correct href', () => {
    cy.task('stubPrisonApiGlobalSearch', [
      {
        offenderNo: 'G0011GX',
        firstName: 'TEST',
        middleNames: 'ING',
        lastName: 'OFFENDER',
        dateOfBirth: '1980-07-17',
        latestLocationId: 'WWI',
        latestLocation: 'Wandsworth',
        pncNumber: '1/2345',
      },
    ])
    const prisonerSearchPage = PrisonerSearchPage.goTo()

    prisonerSearchPage
      .feedbackBannerLink()
      .should('contain', 'Give feedback on this service')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/prisoner-search')
      })

    prisonerSearchPage.firstName().type('Offender')
    prisonerSearchPage.lastName().type('Smith')

    prisonerSearchPage.search().click()

    PrisonerSearchPage.verifyOnPage()
      .feedbackBannerLink()
      .should('contain', 'Give feedback on this service')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/prisoner-search')
      })
  })
})

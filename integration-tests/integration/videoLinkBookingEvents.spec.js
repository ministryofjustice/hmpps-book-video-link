const path = require('path')
const EventsPage = require('../pages/eventsPage')

context('A user can download video link booking events as CSV files', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })

  const downloadsFolder = Cypress.config('downloadsFolder')

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('deleteFolder', downloadsFolder)
  })

  it('Download a csv file', () => {
    cy.task('stubGetEventsCsv', 'h1,h2,h3\n1,2,3')

    cy.visit('/video-link-booking-events')
    const page = EventsPage.verifyOnPage()
    const form = page.form()
    form.startDay().type('28')
    form.startMonth().type('03')
    form.startYear().type('2021')
    form.days().type('7')
    page.downloadButton().click()

    const filename = path.join(downloadsFolder, 'video-link-booking-events-from-2021-03-28-for-7-days.csv')

    // browser might take a while to download the file,
    // so use "cy.readFile" to retry until the file exists
    // and has length - and we assume that it has finished downloading then
    cy.readFile(filename, { timeout: 15000 }).should('equal', 'h1,h2,h3\n1,2,3')
  })
})

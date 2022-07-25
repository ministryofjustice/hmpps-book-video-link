const path = require('path')
const DownloadOptionPage = require('../../pages/downloadReports/downloadOptionPage')
const BookingPage = require('../../pages/downloadReports/bookingPage')

context('A user can download by event timestamp as CSV files', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt', {})
    cy.login()
  })

  const downloadsFolder = Cypress.config('downloadsFolder')

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('deleteFolder', downloadsFolder)
  })

  it('selects download by booking option', () => {
    cy.visit('/video-link-booking-events')
    const page = DownloadOptionPage.verifyOnPage()
    const form = page.form()
    form.dateBooking().type('radio').first().check()
    page.continueButton().click()
    form.heading().contains('Download by date booking was made')
  })

  it('Download a csv file', () => {
    cy.task('stubGetEventsCsv', 'h1,h2,h3\n1,2,3')
    const page = BookingPage.verifyOnPage()
    const form = page.form()
    form.startDay().type('28')
    form.startMonth().type('03')
    form.startYear().type('2021')
    form.days().type('7')
    page.downloadButton().click()

    const filename = path.join(downloadsFolder, 'video-link-events-from-2021-03-28-for-7-days.csv')

    // browser might take a while to download the file,
    // so use "cy.readFile" to retry until the file exists
    // and has length - and we assume that it has finished downloading then
    cy.readFile(filename, { timeout: 15000 }).should('equal', 'h1,h2,h3\n1,2,3')
  })
})

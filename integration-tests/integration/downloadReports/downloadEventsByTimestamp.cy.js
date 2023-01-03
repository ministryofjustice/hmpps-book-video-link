const path = require('path')
const DownloadOptionPage = require('../../pages/downloadReports/downloadOptionPage')
const BookingPage = require('../../pages/downloadReports/bookingPage')

context('A user can download by event timestamp as CSV files', () => {
  const downloadsFolder = Cypress.config('downloadsFolder')

  beforeEach(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('deleteFolder', downloadsFolder)
    cy.task('stubLoginCourt', {})
    cy.login()
  })

  it('downloads events', () => {
    cy.visit('/video-link-booking-events')
    const optionsPage = DownloadOptionPage.verifyOnPage()
    optionsPage.dateBooking().check()
    optionsPage.continueButton().click()

    cy.task('stubGetEventsCsv', 'h1,h2,h3\n1,2,3')
    const page = BookingPage.verifyOnPage()
    page.startDay().type('28')
    page.startMonth().type('03')
    page.startYear().type('2021')
    page.days().type('7')
    page.downloadButton().click()

    const filename = path.join(downloadsFolder, 'video-link-events-from-2021-03-28-for-7-days.csv')

    // browser might take a while to download the file,
    // so use "cy.readFile" to retry until the file exists
    // and has length - and we assume that it has finished downloading then
    cy.readFile(filename, { timeout: 15000 }).should('equal', 'h1,h2,h3\n1,2,3')
  })
})

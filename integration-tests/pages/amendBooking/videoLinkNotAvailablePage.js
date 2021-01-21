const page = require('../page')

const videoLinkNotAvailablePage = () =>
  page('There are no video link bookings available', {
    date: () => cy.get('[data-qa=date]'),
    startTime: () => cy.get('[data-qa=start]'),
    endTime: () => cy.get('[data-qa=end]'),
    continue: () => cy.get('button[type="submit"]'),
    cancel: () => cy.get('[data-qa=cancel'),
  })

export default {
  verifyOnPage: videoLinkNotAvailablePage,
}

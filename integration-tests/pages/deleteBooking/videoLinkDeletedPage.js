const page = require('../page')

const videoLinkDeletedPage = () =>
  page('This videolink booking has been deleted', {
    exit: () => cy.get('[data-qa="back-to-video-link"]'),
    addAppointment: () => cy.get('[data-qa="add-appointment"]'),
  })

export default {
  verifyOnPage: videoLinkDeletedPage,
}

const page = require('../page')

const videoLinkIsAvailablePage = () =>
  page('The video link date and time is available', {
    continue: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: videoLinkIsAvailablePage,
}

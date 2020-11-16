const page = require('./page')

const noServiceAccessPage = () =>
  page('You do not have permission to access this service', {
    exitLink: () => cy.get('[data-qa="back-to-login"]'),
  })

export default {
  verifyOnPage: noServiceAccessPage,
}

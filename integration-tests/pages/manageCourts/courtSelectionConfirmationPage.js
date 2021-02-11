const page = require('../page')

const courtSelectionConfirmationPage = () =>
  page(`Your court list has been updated`, {
    continue: () => cy.get('[data-qa="confirm"]'),
  })

export default {
  verifyOnPage: courtSelectionConfirmationPage,
}

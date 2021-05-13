const page = require('../page')

const courtSelectionConfirmationPage = () =>
  page(`Your court list has been updated`, {
    continue: () => cy.get('[data-qa="confirm"]'),
    courts: () => cy.get('[data-qa="court"]'),
    getCourt: child => cy.get(`.govuk-list > :nth-child(${child})`),
  })

export default {
  verifyOnPage: courtSelectionConfirmationPage,
}

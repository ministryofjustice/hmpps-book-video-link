const page = require('../page')

const changeTimePage = () =>
  page('Change video link time', {
    continue: () => cy.get('button[type="submit"]'),
    cancel: () => cy.get("[data-qa='cancel']"),
    date: () => cy.get('#date'),
  })

export default {
  verifyOnPage: changeTimePage,
  goTo: id => {
    cy.visit(`/change-time/${id}`)
    return changeTimePage()
  },
}

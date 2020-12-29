const page = require('../page')

const prisonerSearchPage = () =>
  page('Search for a prisoner', {
    prisonNumber: () => cy.get('#prisonNumber'),
  })

export default {
  verifyOnPage: prisonerSearchPage,
  goTo: () => {
    cy.visit('/')
    return prisonerSearchPage()
  },
}

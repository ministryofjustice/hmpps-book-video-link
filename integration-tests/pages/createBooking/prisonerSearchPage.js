const page = require('../page')

const prisonerSearchPage = () =>
  page('Search for a prisoner', {
    prisonNumber: () => cy.get('#prisonNumber'),
    firstName: () => cy.get('#firstName'),
    lastName: () => cy.get('#lastName'),
    day: () => cy.get('#dobDay'),
    month: () => cy.get('#dobMonth'),
    year: () => cy.get('#dobYear'),
    search: () => cy.get('button'),
    results: () => cy.get('table tr'),
  })

export default {
  verifyOnPage: prisonerSearchPage,
  goTo: () => {
    cy.visit('/prisoner-search')
    return prisonerSearchPage()
  },
}

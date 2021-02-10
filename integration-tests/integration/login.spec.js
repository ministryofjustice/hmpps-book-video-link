const HomePage = require('../pages/homePage')

context('Login functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
  })

  it('Root (/) redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Login page redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })
  it('Page redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginCourt', {})
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Logout takes user to login page', () => {
    cy.task('stubLoginCourt', {})
    cy.login()
    HomePage.verifyOnPage()

    // can't do a visit here as cypress requires only one domain
    cy.request('/auth/logout').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubLoginCourt', {})
    cy.login()
    HomePage.verifyOnPage()
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })
  it('New user login should log current user out', () => {
    // login as James Stuart
    cy.task('stubLoginCourt', { name: 'James Stuart' })
    cy.login()
    const homePage = HomePage.verifyOnPage()
    homePage.loggedInName().contains('J. Stuart')
    cy.task('stubVerifyToken', false)
    cy.request('/').its('body').should('contain', 'Sign in')

    // now login as Bobby Brown
    cy.task('stubVerifyToken', false)
    cy.task('stubLoginCourt', { name: 'Bobby Brown' })
    cy.login()

    homePage.loggedInName().contains('B. Brown')
  })
})

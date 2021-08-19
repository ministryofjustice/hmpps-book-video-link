context('Health page reports health correctly', () => {
  it('Reports correctly when some down', () => {
    cy.task('reset')
    cy.task('stubHealthAllHealthy')
    cy.task('stubAuthHealth', 500)
    cy.task('stubPrisonApiHealth', 500)

    cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
      expect(response.body.name).to.equal('book-video-link')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        auth: { timeout: 1000, code: 'ECONNABORTED', errno: 'ETIMEDOUT', retries: 2 },
        prison: { timeout: 1000, code: 'ECONNABORTED', errno: 'ETIMEDOUT', retries: 2 },
        tokenverification: 'UP',
        whereabouts: 'UP',
        prisonerOffenderSearch: 'UP',
        prisonRegister: 'UP',
      })
    })
  })

  it('Reports correctly when all are up', () => {
    cy.task('reset')
    cy.task('stubHealthAllHealthy')
    cy.request('/health').then(response => {
      expect(response.body.uptime).to.be.greaterThan(0.0)
      expect(response.body.name).to.equal('book-video-link')
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.version).to.not.be.empty
      expect(response.body.api).to.deep.equal({
        auth: 'UP',
        prison: 'UP',
        tokenverification: 'UP',
        whereabouts: 'UP',
        prisonerOffenderSearch: 'UP',
        prisonRegister: 'UP',
      })
    })
  })
})

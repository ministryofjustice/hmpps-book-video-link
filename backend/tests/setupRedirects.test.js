const express = require('express')
const request = require('supertest')
const nunjucks = require('nunjucks')
const path = require('path')
const setupRedirects = require('../setupRedirects')
const config = require('../config')

config.app.supportUrl = '//supportUrl'

describe('setup redirects', () => {
  let agent
  beforeEach(() => {
    const app = express()
    nunjucks.configure(
      [
        path.join(__dirname, '../../views'),
        'node_modules/govuk-frontend/',
        'node_modules/@ministryofjustice/frontend/',
      ],
      {
        autoescape: true,
        express: app,
      }
    )
    app.set('view engine', 'njk')

    app.use(setupRedirects())

    app.get('/no-service-access', (req, res) => {
      res.render('/noServiceAccess', { email: 'some@email.com', loginUrl: 'some url' })
    })

    agent = request.agent(app)
  })

  it('should redirect to the new support service when the old support url is used', done => {
    agent.get('/content/support').expect('location', '//supportUrl').expect(301, done)
  })

  it('should display the correct page heading', () => {
    return agent
      .get('/no-service-access')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('You do not have permission to access this service')
      })
  })
})

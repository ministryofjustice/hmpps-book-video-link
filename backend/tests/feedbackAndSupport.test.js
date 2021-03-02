const supertest = require('supertest')
const express = require('express')
const path = require('path')

const routes = require('../routes')
const nunjucksSetup = require('../utils/nunjucksSetup')

describe('Feedback and support', () => {
  let request
  beforeEach(() => {
    const app = express()
    nunjucksSetup(app, path)
    const services = /** @type{any} */ ({})
    app.use(routes(services))
    request = supertest(app)
  })

  it("should render the 'Help using Book a video link with a prison' page", async () => {
    await request
      .get('/feedback-and-support')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Help using Book a video link with a prison')
      })
  })
  it('should display the email address link', async () => {
    await request
      .get('/feedback-and-support')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('bookavideolink@digital.justice.gov.uk')
        expect(res.text).toContain('mailto:bookavideolink@digital.justice.gov.uk')
      })
  })
})

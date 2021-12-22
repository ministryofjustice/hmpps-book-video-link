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

    app.use((req, res, next) => {
      res.locals = { preferredCourts: ['ABRDCT'] }
      next()
    })

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
})

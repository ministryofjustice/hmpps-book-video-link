const supertest = require('supertest')
const express = require('express')
const path = require('path')
const { Session } = require('express-session')

const routes = require('../routes')
const nunjucksSetup = require('../utils/nunjucksSetup')

const prisonApi = jest.fn()
const whereaboutsApi = jest.fn()
const oauthApi = jest.fn()

describe('Page not found ', () => {
  let request
  beforeEach(() => {
    const app = express()
    nunjucksSetup(app, path)

    app.use((req, res, next) => {
      req.session = /** @type {Session} */ ({})
      req.session.userDetails = { name: 'Jim', username: 'JIM' }
      res.locals.preferredCourts = 0
      next()
    })
    const services = /** @type{any} */ ({ prisonApi, whereaboutsApi, oauthApi })
    app.use(routes(services))

    request = supertest(app)
  })

  it("should present 'home' page", async () => {
    await request
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Book a video link with a prison')
      })
  })
})

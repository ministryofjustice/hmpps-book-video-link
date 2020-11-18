const supertest = require('supertest')
const express = require('express')
const path = require('path')
const routes = require('../routes')
const nunjucksSetup = require('../utils/nunjucksSetup')

const prisonApi = jest.fn()
const whereaboutsApi = jest.fn()
const oauthApi = jest.fn()

describe('Page not found ', () => {
  let request
  beforeEach(() => {
    const app = express()
    const router = express.Router()

    nunjucksSetup(app, path)
    router.use(routes({ prisonApi, whereaboutsApi, oauthApi }))
    app.use(router)
    request = supertest(app)
  })

  it("should present 'Page not found' page", async () => {
    await request
      .get('/unknown-endpoint')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

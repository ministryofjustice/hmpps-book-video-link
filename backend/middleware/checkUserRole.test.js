const express = require('express')
const request = require('supertest')
const checkUserRole = require('./checkUserRole')

const app = express()

describe('Check user roles', () => {
  it('should redirect to /invalidRole', () => {
    app.use((req, res, next) => {
      res.locals = { userRoles: [] }
      next()
    })

    app.use(checkUserRole())

    return request(app).get('/').expect('location', '/invalidRole').expect(301)
  })
})

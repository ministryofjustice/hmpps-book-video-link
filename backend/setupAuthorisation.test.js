const express = require('express')
const request = require('supertest')
const setupAuthorisation = require('./setupAuthorisation')

describe('Check user roles', () => {
  const app = express()
  const getUserRoles = jest.fn()

  beforeEach(() => {
    app.use((req, res, next) => {
      res.locals = { userRoles: getUserRoles() }
      next()
    })

    app.use(setupAuthorisation())

    app.get('/', (req, res) => {
      return res.send('protected resource')
    })
  })
  it('should redirect to /noServiceAccess as user has no roles', () => {
    getUserRoles.mockReturnValue([])
    return request(app).get('/').expect('location', '/no-service-access').expect(301)
  })

  it('should redirect to /noServiceAccess as user only has some roles', () => {
    const userRoles = [{ roleCode: 'GLOBAL_APPOINTMENT' }, { roleCode: 'VIDEO_LINK_COURT_USER' }]
    getUserRoles.mockReturnValue(userRoles)
    return request(app).get('/').expect('location', '/no-service-access').expect(301)
  })

  it('should redirect to /noServiceAccess as user has only some roles and some are duplicated', () => {
    const userRoles = [
      { roleCode: 'GLOBAL_APPOINTMENT' },
      { roleCode: 'VIDEO_LINK_COURT_USER' },
      { roleCode: 'VIDEO_LINK_COURT_USER' },
    ]
    getUserRoles.mockReturnValue(userRoles)
    return request(app).get('/').expect('location', '/no-service-access').expect(301)
  })

  it('should call the next middleware as user has all the required roles', () => {
    const userRoles = [
      { roleCode: 'GLOBAL_APPOINTMENT' },
      { roleCode: 'GLOBAL_SEARCH' },
      { roleCode: 'VIDEO_LINK_COURT_USER' },
    ]

    getUserRoles.mockReturnValue(userRoles)

    return request(app)
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.text).toBe('protected resource')
      })
  })

  it('should call the next middleware as user has all the required roles even though some are duplicated', () => {
    const userRoles = [
      { roleCode: 'GLOBAL_APPOINTMENT' },
      { roleCode: 'GLOBAL_SEARCH' },
      { roleCode: 'VIDEO_LINK_COURT_USER' },
      { roleCode: 'GLOBAL_SEARCH' },
      { roleCode: 'VIDEO_LINK_COURT_USER' },
    ]

    getUserRoles.mockReturnValue(userRoles)

    return request(app)
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.text).toBe('protected resource')
      })
  })
})

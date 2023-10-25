import nock from 'nock'

import Client from './oauthEnabledClient'
import ManageUsersApi from './manageUsersApi'

const baseUrl = 'http://localhost:8080'

describe('court api tests', () => {
  const client = new Client({ baseUrl, timeout: 2000 })
  const manageUsersApi = new ManageUsersApi(client)
  const mock = nock(baseUrl)

  const userDetails = {
    username: 'DEMO_USER1',
    active: false,
    name: 'John Smith',
    authSource: 'nomis',
    staffId: 231232,
    activeCaseLoadId: 'MDI',
    userId: '231232',
    uuid: '5105a589-75b3-4ca0-9433-b96228c1c8f3',
  }

  const emailAddress = {
    username: 'DEMO_USER1',
    email: 'demo.user@nomis.com',
    verified: true,
  }

  const userRoles = [{ roleCode: 'GLOBAL_SEARCH' }]

  afterEach(() => {
    nock.cleanAll()
  })

  describe('currentUser', () => {
    it("Gets the current user's details", async () => {
      mock.get('/users/me').reply(200, userDetails)

      const data = await manageUsersApi.currentUser({})
      expect(data).toEqual(userDetails)
    })
  })

  describe('userRoles', () => {
    it("Gets the current user's roles", async () => {
      mock.get('/users/me/roles').reply(200, userRoles)

      const data = await manageUsersApi.userRoles({})
      expect(data).toEqual(userRoles)
    })
  })

  describe('userEmail', () => {
    it("Gets the specified user's email address", async () => {
      mock.get('/users/DEMO_USER1/email').reply(200, emailAddress)

      const data = await manageUsersApi.userEmail({}, 'DEMO_USER1')
      expect(data).toEqual(emailAddress)
    })
  })

  describe('userDetails', () => {
    it("Gets the specified user's details", async () => {
      mock.get('/users/DEMO_USER1').reply(200, userDetails)

      const data = await manageUsersApi.userDetails({}, 'DEMO_USER1')
      expect(data).toEqual(userDetails)
    })
  })
})

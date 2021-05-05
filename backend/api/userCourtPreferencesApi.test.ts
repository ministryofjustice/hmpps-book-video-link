import nock from 'nock'

import Client from './oauthEnabledClient'
import UserCourtPreferencesApi from './userCourtPreferencesApi'

const baseUrl = 'http://localhost:8080'

describe('court api tests', () => {
  const client = new Client({ baseUrl, timeout: 2000 })
  const userCourtPreferencesApi = new UserCourtPreferencesApi(client)
  const mock = nock(baseUrl)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET court preferences', () => {
    it('Gets preferred courts', async () => {
      mock.get('/users/user_1/preferences/video_link_booking.preferred_courts').reply(200, { items: ['ABC'] })

      const data = await userCourtPreferencesApi.getUserPreferredCourts('user_1')
      expect(data).toEqual({ items: ['ABC'] })
    })
  })

  describe('PUT court preferences', () => {
    it('Sets preferred courts', async () => {
      mock.put('/users/user_1/preferences/video_link_booking.preferred_courts').reply(200, { items: ['ABC', 'DEF'] })
      const context = { user: { username: 'user_2' } }
      const response = await userCourtPreferencesApi.putUserPreferredCourts(context, 'user_1', ['ABC', 'DEF'])
      expect(response).toEqual({ items: ['ABC', 'DEF'] })
    })
  })
})

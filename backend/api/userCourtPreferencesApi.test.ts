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
      mock.get('/users/A_USER/preferences/video_link_booking.preferred_courts').reply(200, { items: ['ABC'] })

      const data = await userCourtPreferencesApi.getUserPreferredCourts({}, 'A_USER')
      expect(data).toEqual({ items: ['ABC'] })
    })
  })

  describe('PUT court preferences', () => {
    it('Sets preferred courts', async () => {
      mock.put('/users/A_USER/preferences/video_link_booking.preferred_courts').reply(200, { items: ['ABC', 'DEF'] })
      const response = await userCourtPreferencesApi.putUserPreferredCourts({}, 'A_USER', ['ABC', 'DEF'])
      expect(response).toEqual({ items: ['ABC', 'DEF'] })
    })
  })
})

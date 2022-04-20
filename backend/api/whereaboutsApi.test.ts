import nock from 'nock'

import Client from './oauthEnabledClient'
import WhereaboutsApi from './whereaboutsApi'

const baseUrl = 'http://localhost:8080'

describe('whereabouts api tests', () => {
  const client = new Client({ baseUrl, timeout: 2000 })
  const whereaboutsApi = new WhereaboutsApi(client)
  const mock = nock(baseUrl)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET court email', () => {
    it('Gets court email address', async () => {
      mock.get('/court/courts/DRBYCC/email').reply(200, { email: 'court@gmail.com' })

      const data = await whereaboutsApi.getCourtEmail({}, 'DRBYCC')
      expect(data).toEqual({ email: 'court@gmail.com' })
    })

    it('Does not get court email', async () => {
      mock.get('/court/courts/DRBYCC/email').reply(404)
      const data = await whereaboutsApi.getCourtEmail({}, 'DRBYCC')
      expect(data).toEqual(undefined)
    })
  })
})

import nock from 'nock'

import Client from './oauthEnabledClient'
import CourtApi from './courtApi'

const baseUrl = 'http://localhost:8080'

describe('court api tests', () => {
  const client = new Client({ baseUrl, timeout: 2000 })
  const courtApi = new CourtApi(client)
  const mock = nock(baseUrl)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET courts', () => {
    it('Calls court endpoint', async () => {
      mock
        .get('/courts/paged?courtTypeIds=CRN&courtTypeIds=COU&courtTypeIds=MAG&courtTypeIds=IMM&size=1000')
        .reply(200, { content: [{ courtId: 'ABC' }] })
      const data = await courtApi.getCourts()
      expect(data).toEqual([{ courtId: 'ABC' }])
    })
  })
})

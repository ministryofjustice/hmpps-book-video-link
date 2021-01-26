const nock = require('nock')
const Client = require('./oauthEnabledClient')
const contextProperties = require('../contextProperties')
const logger = require('../log')

const hostname = 'http://localhost:8080'

describe('Test clients built by oauthEnabledClient', () => {
  it('should build something', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 2000 })
    expect(client).not.toBeNull()
  })

  describe('Assert client behaviour', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 2000 })
    const getRequest = nock(hostname)

    beforeEach(() => {
      getRequest.get('/api/users/me').reply(200, {})
    })

    afterEach(() => {
      nock.cleanAll()
    })

    it('Should set the authorization header with "Bearer <access token>"', async () => {
      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: null }, context)
      /** @type {any} */
      const response = await client.get(context, '/api/users/me')

      expect(response.status).toEqual(200)
      expect(response.request.header.authorization).toEqual('Bearer a')
    })

    it('Should succeed when there are no authorization headers', async () => {
      /** @type {any} */
      const response = await client.get({}, '/api/users/me')
      expect(response.request.header.authorization).toBeUndefined()
    })

    it('Should set the pagination headers on requests', async () => {
      const context = {}
      contextProperties.setRequestPagination(context, { 'page-offset': '0', 'page-limit': '10' })
      /** @type {any} */
      const response = await client.get(context, '/api/users/me')

      expect(response.request.header).toEqual(expect.objectContaining({ 'page-offset': '0', 'page-limit': '10' }))
    })

    it('Should set the results limit header override on requests', async () => {
      const context = {}
      contextProperties.setRequestPagination(context, { 'page-offset': '0', 'page-limit': '10' })
      /** @type {any} */
      const response = await client.get(context, '/api/users/me', 500)

      expect(response.request.header).toEqual(expect.objectContaining({ 'page-offset': '0', 'page-limit': '500' }))
    })

    it('Should set custom headers on requests', async () => {
      const context = {}
      contextProperties.setCustomRequestHeaders(context, { 'custom-header': 'custom-value' })
      /** @type {any} */
      const response = await client.get(context, '/api/users/me')

      expect(response.request.header).toEqual(expect.objectContaining({ 'custom-header': 'custom-value' }))
    })
  })

  describe('retry and timeout behaviour', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 900 })
    const mock = nock(hostname)

    afterEach(() => {
      nock.cleanAll()
    })

    describe('get', () => {
      it('Should retry twice if request fails', async () => {
        mock
          .get('/api/users/me')
          .reply(500, { failure: 'one' })
          .get('/api/users/me')
          .reply(500, { failure: 'two' })
          .get('/api/users/me')
          .reply(200, { hi: 'bob' })

        const response = await client.get({}, '/api/users/me')
        expect(response.body).toEqual({ hi: 'bob' })
      })

      it('Should retry twice if request times out', async () => {
        mock
          .get('/api/users/me')
          .delay(10000) // delay set to 10s, timeout to 900/3=300ms
          .reply(200, { failure: 'one' })
          .get('/api/users/me')
          .delay(10000)
          .reply(200, { failure: 'two' })
          .get('/api/users/me')
          .reply(200, { hi: 'bob' })

        const response = await client.get({}, '/api/users/me')
        expect(response.body).toEqual({ hi: 'bob' })
      })

      it('Should fail if request times out three times', async () => {
        mock
          .get('/api/users/me')
          .delay(10000) // delay set to 10s, timeout to 900/3=300ms
          .reply(200, { failure: 'one' })
          .get('/api/users/me')
          .delay(10000)
          .reply(200, { failure: 'two' })
          .get('/api/users/me')
          .delay(10000)
          .reply(200, { failure: 'three' })

        await expect(client.get({}, '/api/users/me')).rejects.toThrow('Timeout of 300ms exceeded')
      })
    })
  })

  describe('Normalise base url behaviour', () => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('Should set the url correctly if ends with a /', async () => {
      const client = new Client({ baseUrl: `${hostname}/`, timeout: 2000 })
      nock(hostname).get('/api/users/me').reply(200, {})

      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: null }, context)
      /** @type {any} */
      const response = await client.get(context, '/api/users/me')

      expect(response.request.url).toEqual('http://localhost:8080/api/users/me')
    })

    it("Should set the url correctly if doesn't end with a /", async () => {
      const client = new Client({ baseUrl: hostname, timeout: 2000 })
      nock(hostname).get('/api/users/me').reply(200, {})

      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: null }, context)
      /** @type {any} */
      const response = await client.get(context, '/api/users/me')

      expect(response.request.url).toEqual('http://localhost:8080/api/users/me')
    })
  })

  describe('Logging', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 20000 })
    logger.warn = jest.fn()
    afterEach(() => {
      nock.cleanAll()
    })

    it('Should log 404 correctly', async () => {
      nock(hostname).get('/api/users/me').reply(404)

      await expect(client.get({}, '/api/users/me')).rejects.toThrow('Not Found')

      expect(logger.warn).toHaveBeenCalledWith('GET /api/users/me No record found')
    })

    it('Should log 500 correctly', async () => {
      nock(hostname).get('/api/users/me').reply(500).get('/api/users/me').reply(500).get('/api/users/me').reply(500)

      await expect(client.get({}, '/api/users/me')).rejects.toThrow('Internal Server Error')

      expect(logger.warn).toHaveBeenCalledWith('API error in GET /api/users/me 500 Internal Server Error {}')
    })
  })

  describe('Delete', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 20000 })
    logger.warn = jest.fn()
    afterEach(() => {
      nock.cleanAll()
    })

    it('Should set the authorization header with "Bearer <access token>"', async () => {
      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: null }, context)
      nock(hostname).delete('/api/users/me').reply(200)
      /** @type {any} */
      const response = await client.delete(context, '/api/users/me')

      expect(response.status).toEqual(200)
      expect(response.request.header.authorization).toEqual('Bearer a')
    })

    it('Should log 404 correctly', async () => {
      nock(hostname).delete('/api/users/me').reply(404)

      await expect(client.delete({}, '/api/users/me')).rejects.toThrow('Not Found')

      expect(logger.warn).toHaveBeenCalledWith('DELETE /api/users/me No record found')
    })

    it('Should log 500 correctly', async () => {
      nock(hostname).delete('/api/users/me').reply(500).get('/api/users/me').reply(500).get('/api/users/me').reply(500)

      await expect(client.delete({}, '/api/users/me')).rejects.toThrow('Internal Server Error')

      expect(logger.warn).toHaveBeenCalledWith('API error in DELETE /api/users/me 500 Internal Server Error {}')
    })
  })

  describe('Put', () => {
    const client = new Client({ baseUrl: `${hostname}/`, timeout: 20000 })
    logger.warn = jest.fn()
    afterEach(() => {
      nock.cleanAll()
    })

    it('Should set the authorization header with "Bearer <access token>"', async () => {
      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: null }, context)
      nock(hostname).put('/api/users/me').reply(200)
      /** @type {any} */
      const response = await client.put(context, '/api/users/me')

      expect(response.status).toEqual(200)
      expect(response.request.header.authorization).toEqual('Bearer a')
    })

    it('Should log 404 correctly', async () => {
      nock(hostname).put('/api/users/me').reply(404)

      await expect(client.put({}, '/api/users/me')).rejects.toThrow('Not Found')

      expect(logger.warn).toHaveBeenCalledWith('PUT /api/users/me No record found')
    })

    it('Should log 500 correctly', async () => {
      nock(hostname).put('/api/users/me').reply(500).get('/api/users/me').reply(500).get('/api/users/me').reply(500)

      await expect(client.put({}, '/api/users/me')).rejects.toThrow('Internal Server Error')

      expect(logger.warn).toHaveBeenCalledWith('API error in PUT /api/users/me 500 Internal Server Error {}')
    })
  })
})

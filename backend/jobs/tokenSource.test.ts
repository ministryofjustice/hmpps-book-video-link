import nock from 'nock'
import TokenSource from './tokenSource'

const host = 'http://localhost'
const path = '/oauth/token?grant_type=client_credentials'
const tokens = { access_token: 'at', refresh_token: 'rt' }
const tokenSource = new TokenSource({
  clientId: 'a',
  clientSecret: 'b',
  url: 'http://localhost/',
  timeoutSeconds: 1,
})

describe('TokenSource tests', () => {
  it('success returns tokens', async () => {
    nock(host).post(path).reply(200, tokens)
    const receivedTokens = await tokenSource.getTokens()
    expect(receivedTokens).toStrictEqual(tokens)
  })

  it('check request headers', async () => {
    nock(host, {
      reqheaders: {
        authorization: 'Basic YTpi',
        'content-type': 'application/json',
        accept: 'application/json',
      },
    })
      .post(path)
      .reply(200, tokens)
    await tokenSource.getTokens()
  })

  it('times out', async () => {
    nock(host)
      .post(path)
      .reply((uri, requestBody, cb) => {
        setTimeout(() => cb(null, [200, tokens]), 1050)
      })

    await expect(tokenSource.getTokens()).rejects.toThrow('timeout of 1000ms exceeded')
  })

  it('client error', async () => {
    nock(host).post(path).reply(400, {})

    await expect(tokenSource.getTokens()).rejects.toThrow('Request failed with status code 400')
  })

  it('server error', async () => {
    nock(host).post(path).reply(500, null)

    await expect(tokenSource.getTokens()).rejects.toThrow('Request failed with status code 500')
  })
})

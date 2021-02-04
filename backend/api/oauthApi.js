/** @type {any} */
const axios = require('axios')
const querystring = require('querystring')
const logger = require('../log')
const errorStatusCode = require('../error-status-code')

const apiClientCredentials = (clientId, clientSecret) => Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

/**
 * Return an oauthApi built using the supplied configuration.
 * @param client
 * @param {object} params
 * @param {string} params.clientId
 * @param {string} params.clientSecret
 * @param {string} params.url
 * @returns a configured oauthApi instance
 */
const oauthApiFactory = (client, { clientId, clientSecret, url }) => {
  const get = (context, path) => client.get(context, path).then(response => response.body)
  const currentUser = context => get(context, '/api/user/me')
  const userRoles = context => get(context, '/api/user/me/roles')
  const userEmail = (context, username) => get(context, `/api/user/${username}/email`)
  const userDetails = (context, username) => get(context, `/api/user/${username}`)

  const oauthAxios = axios.create({
    baseURL: `${url}oauth/token`,
    method: 'post',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${apiClientCredentials(clientId, clientSecret)}`,
    },
  })

  // eslint-disable-next-line camelcase
  const parseOauthTokens = ({ access_token, refresh_token }) => ({
    access_token,
    refresh_token,
  })

  const makeTokenRequest = (data, msg) =>
    oauthAxios({ data })
      .then(response => {
        logger.debug(
          `${msg} ${response.config.method} ${response.config.url} ${response.status} ${response.statusText}`
        )
        return parseOauthTokens(response.data)
      })
      .catch(error => {
        const status = errorStatusCode(error)
        const errorDesc = (error.response && error.response.data && error.response.data.error_description) || null

        if (parseInt(status, 10) < 500 && errorDesc !== null) {
          logger.info(`${msg} ${error.config.method} ${error.config.url} ${status} ${errorDesc}`)

          throw Error('Authentication error')
        }

        logger.error(`${msg} ${error.config.method} ${error.config.url} ${status} ${error.message}`)
        throw error
      })

  /**
   * Perform OAuth token refresh, returning the tokens to the caller. See scopedStore.run.
   * @returns A Promise that resolves when token refresh has succeeded and the OAuth tokens have been returned.
   */
  const refresh = refreshToken =>
    makeTokenRequest(querystring.stringify({ refresh_token: refreshToken, grant_type: 'refresh_token' }), 'refresh:')

  return {
    currentUser,
    userRoles,
    userEmail,
    userDetails,
    refresh,
  }
}

module.exports = { oauthApiFactory, apiClientCredentials }

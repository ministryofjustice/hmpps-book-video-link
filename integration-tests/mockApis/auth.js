const jwt = require('jsonwebtoken')
const { stubFor, getMatchingRequests } = require('./wiremock')

const createToken = () => {
  const payload = {
    user_name: 'COURT_USER',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities: ['ROLE_GLOBAL_SEARCH'],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'dev',
  }

  const token = jwt.sign(payload, 'secret', { expiresIn: '1h' })
  return token
}

const getLoginUrl = () =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/login/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=.+?',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3008/login/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const logout = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/auth/logout',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const token = () =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3008/login/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(),
        token_type: 'bearer',
        refresh_token: 'refresh',
        user_name: 'TEST_USER',
        expires_in: 600,
        scope: 'read write',
        internalUser: true,
      },
    },
  })

const stubUser = username => {
  const user = username || 'COURT_USER'
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: `/users/${encodeURI(user)}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        user_name: user,
        staffId: 231232,
        username: user,
        active: true,
        name: `${user} name`,
        authSource: 'nomis',
      },
    },
  })
}

const stubUserMe = ({ username = 'COURT_USER', staffId = 12345, name } = {}) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username,
        staffId,
        name,
      },
    },
  })
}

const stubUserMeRoles = (roles = ['ROLE']) =>
  stubFor({
    request: {
      method: 'GET',
      url: '/users/me/roles',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: roles,
    },
  })

const stubEmail = username =>
  stubFor({
    request: {
      method: 'GET',
      url: `/users/${encodeURI(username)}/email`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username,
        email: `${username}@gov.uk`,
      },
    },
  })

const stubUnverifiedEmail = username =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/users/${encodeURI(username)}/email`,
    },
    response: {
      status: 204,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubHealth = (status = 200) =>
  stubFor({
    request: {
      method: 'GET',
      url: '/auth/health/ping',
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      fixedDelayMilliseconds: status === 500 ? 3000 : '',
    },
  })

const stubClientCredentialsRequest = () =>
  stubFor({
    request: {
      method: 'POST',
      url: '/auth/oauth/token',
    },
    response: {
      status: 200,
    },
  })

module.exports = {
  stubHealth,
  getLoginUrl,
  stubLoginCourt: user =>
    Promise.all([
      favicon(),
      redirect(),
      logout(),
      token(),
      stubUserMe(user),
      stubUserMeRoles([{ roleCode: 'GLOBAL_SEARCH' }, { roleCode: 'VIDEO_LINK_COURT_USER' }]),
    ]),
  stubUserDetailsRetrieval: username => Promise.all([stubUser(username), stubEmail(username)]),
  stubUnverifiedUserDetailsRetrieval: username => Promise.all([stubUser(username), stubUnverifiedEmail(username)]),
  stubUserMe,
  stubUserMeRoles,
  stubUser,
  stubEmail,
  redirect,
  stubClientCredentialsRequest,
}

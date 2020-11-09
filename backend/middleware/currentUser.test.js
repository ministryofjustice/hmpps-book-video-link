const currentUser = require('./currentUser')

describe('Current user', () => {
  const oauthApi = {}
  let req
  let res

  beforeEach(() => {
    oauthApi.currentUser = jest.fn()

    oauthApi.currentUser.mockReturnValue({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })

    req = { session: {} }
    res = { locals: {} }
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ oauthApi })

    await controller(req, res, () => {})

    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })
  })

  it('should stash data into res.locals', async () => {
    const controller = currentUser({ oauthApi })

    await controller(req, res, () => {})

    expect(res.locals.user).toEqual({
      displayName: 'Bob Smith',
      username: 'USER_BOB',
    })
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser({ oauthApi })
    req.xhr = true

    const next = jest.fn()

    await controller(req, res, next)

    expect(oauthApi.currentUser.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })
})

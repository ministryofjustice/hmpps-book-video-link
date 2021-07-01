import currentUser from './currentUser'
import ManageCourtsService from '../services/manageCourtsService'

const oauthApi = {
  currentUser: jest.fn(),
  userRoles: jest.fn(),
}

jest.mock('../services/manageCourtsService')

const manageCourtsService = new ManageCourtsService(null, null) as jest.Mocked<ManageCourtsService>

describe('Current user', () => {
  let req
  let res
  const next = jest.fn()

  const courtList = [
    {
      id: 'ABDRCT',
      name: 'Aberdare County Court',
    },
    {
      id: 'ABDRMC',
      name: 'Aberdare Mc',
    },
    {
      id: 'ABDRYC',
      name: 'Aberdare Youth Court',
    },
  ]

  beforeEach(() => {
    jest.resetAllMocks()
    oauthApi.currentUser = jest.fn()
    oauthApi.userRoles = jest.fn()

    oauthApi.currentUser.mockReturnValue({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })

    oauthApi.userRoles.mockReturnValue([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])

    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get: jest.fn() }

    res = { locals: {} }
  })

  it('should request and store user details', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)

    await controller(req, res, next)

    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })
  })

  it('should request and store user roles to session', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)

    await controller(req, res, next)

    expect(oauthApi.userRoles).toHaveBeenCalled()
    expect(req.session.userRoles).toEqual([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])
  })

  it('should call get', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)
    const get = jest.fn().mockReturnValue('someHost')
    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get }

    await controller(req, res, next)

    expect(get).toHaveBeenCalledWith('host')
  })
  it('should stash user data into res.locals', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)
    const get = jest.fn().mockReturnValue('someHost')
    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get }

    await controller(req, res, next)

    expect(res.locals.user).toEqual({
      clientID: 'book-video-link-client',
      displayName: 'B. Smith',
      returnUrl: 'http://someHost/somethingelse',
      username: 'USER_BOB',
    })
  })

  it('should stash userRole data into res.locals', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)

    await controller(req, res, next)

    expect(res.locals.userRoles).toEqual([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])
  })

  it('should stash preferredCourts data into res.locals when a user has selected preferred courts', async () => {
    manageCourtsService.getSelectedCourts.mockResolvedValue(courtList)
    const controller = currentUser(oauthApi, manageCourtsService)

    await controller(req, res, next)

    expect(res.locals.preferredCourts).toEqual(courtList)
  })

  it('should stash an empty array of no preferredCourts data into res.locals when a user has not selected preferred courts', async () => {
    manageCourtsService.getSelectedCourts.mockResolvedValue([])
    const controller = currentUser(oauthApi, manageCourtsService)

    await controller(req, res, next)

    expect(res.locals.preferredCourts).toEqual([])
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser(oauthApi, manageCourtsService)
    req.xhr = true

    await controller(req, res, next)

    expect(oauthApi.currentUser.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })
})

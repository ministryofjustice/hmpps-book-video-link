import storeCurrentUrl from './storeCurrentUrl'
import { mockRequest, mockResponse, mockNext } from '../routes/__test/requestTestUtils'

describe('Store Current Url', () => {
  const res = mockResponse({ locals: {} })
  const next = mockNext()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Should add hostname and currentUrlPath to res.locals', async () => {
    const req = mockRequest({ baseUrl: '/', path: '', hostname: 'localhost' })
    await storeCurrentUrl()(req, res, next)

    expect(res.locals.hostname).toStrictEqual('localhost')
    expect(res.locals.currentUrlPath).toStrictEqual('/')
  })

  it('Should remove offender number from currentUrlPath if present', async () => {
    const req = mockRequest({
      baseUrl: '',
      path: '/WWI/offenders/A1234AA/add-court-appointment',
      hostname: 'localhost',
    })
    await storeCurrentUrl()(req, res, next)

    expect(res.locals.currentUrlPath).not.toContain('A1234AA')
    expect(res.locals.currentUrlPath).toStrictEqual('/WWI/offenders/:offenderNo/add-court-appointment')
  })

  it('Should not adjust currentUrlPath if no offender number is present', async () => {
    const req = mockRequest({
      baseUrl: '',
      path: '/prisoner-search',
      hostname: 'localhost',
    })
    await storeCurrentUrl()(req, res, next)

    expect(res.locals.currentUrlPath).not.toContain('offenderNo')
    expect(res.locals.currentUrlPath).toStrictEqual('/prisoner-search')
  })

  it('Should not remove content content similar to offender number from currentUrlPath if it does not follow /', async () => {
    const req = mockRequest({
      baseUrl: '',
      path: '/WWI/offenders/somethingA1234AAsomething/add-court-appointment',
      hostname: 'localhost',
    })
    await storeCurrentUrl()(req, res, next)

    expect(res.locals.currentUrlPath).toContain('A1234AA')
    expect(res.locals.currentUrlPath).not.toBe('/WWI/offenders/something:offenderNosomething/add-court-appointment')
  })

  it('Should not remove content content similar to offender number from currentUrlPath if it does not follow / and ends in /', async () => {
    const req = mockRequest({
      baseUrl: '',
      path: '/WWI/offenders/somethingA1234AA/add-court-appointment',
      hostname: 'localhost',
    })
    await storeCurrentUrl()(req, res, next)

    expect(res.locals.currentUrlPath).toContain('A1234AA')
    expect(res.locals.currentUrlPath).not.toBe('/WWI/offenders/something:offenderNo/add-court-appointment')
  })
})

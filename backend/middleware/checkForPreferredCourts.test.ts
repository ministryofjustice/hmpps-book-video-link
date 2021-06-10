import { mockRequest, mockResponse, mockNext } from '../routes/__test/requestTestUtils'
import { UserPreferenceCourt } from '../services/manageCourtsService'

import checkForPreferredCourts from './checkForPreferredCourts'

describe('Preferred courts check middleware', () => {
  const req = mockRequest({})
  const next = mockNext()

  const createCourt = (courtId: string, courtName: string): UserPreferenceCourt => ({ courtId, courtName })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect to courts not selected page when a user has no preferred courts', () => {
    const res = mockResponse({ locals: { user: { returnUrl: '/' }, preferredCourts: [] } })

    checkForPreferredCourts()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/courts-not-selected')
  })

  it('should not redirect to courts not selected page if a user already has preferred courts', () => {
    const res = mockResponse({ locals: { user: { returnUrl: '/' }, preferredCourts: [createCourt('1', 'A Court')] } })

    checkForPreferredCourts()(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
  })
})

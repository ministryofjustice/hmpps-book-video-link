import { Response } from 'express'
import type { CourtDto } from 'courtRegister'
import { mockRequest, mockResponse } from '../routes/__test/requestTestUtils'

import checkForPreferredCourts from './checkForPreferredCourts'

describe('Preferred courts check middleware', () => {
  const req = mockRequest({})
  const res = mockResponse({})
  const manageCourtsEnabled = true

  const createCourt = (courtId: string, courtName: string): CourtDto => {
    return {
      courtId,
      courtName,
      type: {
        courtType: 'CRN',
        courtName,
      },
      active: true,
    }
  }

  const handleCheckWithLinkAndCourts = (returnUrl: string, courts: CourtDto[]) =>
    checkForPreferredCourts(manageCourtsEnabled)(
      req,
      ({ ...res, locals: { user: { returnUrl }, preferredCourts: courts } } as unknown) as Response,
      null
    )

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect to courts not selected page when a user has no preferred courts', async () => {
    handleCheckWithLinkAndCourts('/', [])

    expect(res.render).toHaveBeenCalledWith('courtsNotSelected.njk', {})
  })

  it('should not redirect to courts not selected page if a user already has preferred courts', async () => {
    handleCheckWithLinkAndCourts('/', [createCourt('1', 'A Court')])

    expect(res.render).toHaveBeenCalledTimes(0)
  })
})

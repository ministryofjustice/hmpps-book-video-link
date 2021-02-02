import { Request, Response } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { clearUpdate, getUpdate, setUpdate, cookieOptions } from './state'

describe('state', () => {
  describe('clearUpdate', () => {
    it('interacts with response', () => {
      const res = ({ clearCookie: jest.fn() } as unknown) as Response<unknown>

      clearUpdate(res)

      expect(res.clearCookie).toBeCalledWith('booking-update', cookieOptions)
    })
  })

  describe('getUpdate', () => {
    it('interacts with request and returns signed cookie', () => {
      const req = ({
        signedCookies: {
          'booking-update': {
            agencyId: 'MDI',
            date: '2020-11-20T18:00:00',
            startTime: '2020-11-20T18:00:00',
            endTime: '2020-11-20T19:00:00',
            preRequired: 'true',
            postRequired: 'true',
          },
        },
      } as unknown) as Request

      const result = getUpdate(req)

      expect(result).toStrictEqual({
        agencyId: 'MDI',
        date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        postRequired: true,
        preRequired: true,
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      })
    })

    it('returns undefined when no state', () => {
      const req = ({
        signedCookies: {},
      } as unknown) as Request

      const result = getUpdate(req)

      expect(result).toStrictEqual(undefined)
    })

    it('validates field are present and correct type', () => {
      const req = ({
        signedCookies: {
          'booking-update': {
            agencyId: 'MDI',
            date: '2020-11-20T18:00:00',
            startTime: '2020-11-20T18:00:00',
            preRequired: 'true',
            postRequired: true,
          },
        },
      } as unknown) as Request

      expect(() => getUpdate(req)).toThrowError('Missing or invalid keys: endTime,postRequired')
    })
  })

  describe('setUpdate', () => {
    it('sets signed cookie', () => {
      const res = ({ cookie: jest.fn() } as unknown) as Response<unknown>

      setUpdate(res, {
        agencyId: 'MDI',
        date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
        postRequired: true,
        preRequired: true,
        startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      })

      expect(res.cookie).toHaveBeenCalledWith(
        'booking-update',
        {
          agencyId: 'MDI',
          date: '2020-11-20T18:00:00',
          endTime: '2020-11-20T19:00:00',
          postRequired: 'true',
          preRequired: 'true',
          startTime: '2020-11-20T18:00:00',
        },
        cookieOptions
      )
    })
  })
})

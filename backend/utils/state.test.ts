import { Request, Response } from 'express'
import moment, { Moment } from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'
import { assertHasStringValues } from '../utils'
import { cookieOptions, Codec, clearState, getState, setState } from './state'

type TestType = {
  agencyId: string
  date: Moment
  required: boolean
}

const TestCodec: Codec<TestType> = {
  write: (value: TestType): Record<string, string> => {
    return {
      agencyId: value.agencyId,
      date: value.date.format(DATE_TIME_FORMAT_SPEC),
      required: value.required.toString(),
    }
  },

  read(record: Record<string, unknown>): TestType {
    assertHasStringValues(record, ['agencyId', 'date', 'required'])
    return {
      agencyId: record.agencyId,
      date: moment(record.date, DATE_TIME_FORMAT_SPEC, true),
      required: record.required === 'true',
    }
  },
}

describe('state', () => {
  describe('clearUpdate', () => {
    it('interacts with response', () => {
      const res = ({ clearCookie: jest.fn() } as unknown) as Response<unknown>

      clearState('test')(res)

      expect(res.clearCookie).toBeCalledWith('test', cookieOptions)
    })
  })

  describe('getState', () => {
    it('interacts with request and returns signed cookie', () => {
      const req = ({
        signedCookies: {
          test: {
            agencyId: 'MDI',
            date: '2020-11-20T18:00:00',
            required: 'true',
          },
        },
      } as unknown) as Request

      const result = getState('test', TestCodec)(req)

      expect(result).toStrictEqual({
        agencyId: 'MDI',
        date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        required: true,
      })
    })

    it('returns undefined when no state', () => {
      const req = ({
        signedCookies: {},
      } as unknown) as Request

      const result = getState('test', TestCodec)(req)

      expect(result).toStrictEqual(undefined)
    })

    it('validates field are present and correct type', () => {
      const req = ({
        signedCookies: {
          test: {
            agencyId: 'MDI',
            required: true,
          },
        },
      } as unknown) as Request

      expect(() => getState('test', TestCodec)(req)).toThrowError('Missing or invalid keys: date,required')
    })
  })

  describe('setState', () => {
    it('sets signed cookie', () => {
      const res = ({ cookie: jest.fn() } as unknown) as Response<unknown>

      setState('test', TestCodec)(res, {
        agencyId: 'MDI',
        date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
        required: true,
      })

      expect(res.cookie).toHaveBeenCalledWith(
        'test',
        {
          agencyId: 'MDI',
          date: '2020-11-20T18:00:00',
          required: 'true',
        },
        cookieOptions
      )
    })
  })
})

import moment from 'moment'
import {
  createInterval,
  getPreAppointmentInterval,
  getPostAppointmentInterval,
  getTotalAppointmentInterval,
  getPreDescription,
  getPostDescription,
} from './bookingTimes'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'

describe('bookingTimes', () => {
  const startTime = moment('2020-11-20T10:30:00', DATE_TIME_FORMAT_SPEC, true)
  const endTime = moment('2020-11-20T11:00:00', DATE_TIME_FORMAT_SPEC, true)

  test('createInterval', () => {
    expect(createInterval([startTime, endTime])).toStrictEqual({ start: '10:30', end: '11:00' })
  })

  test('getPreAppointmentInterval', () => {
    expect(getPreAppointmentInterval(startTime)).toStrictEqual({ start: '10:15', end: '10:30' })
  })

  test('getPostAppointmentInterval', () => {
    expect(getPostAppointmentInterval(endTime)).toStrictEqual({ start: '11:00', end: '11:15' })
  })

  describe('getTotalAppointmentInterval', () => {
    test('both pre and post', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, true, true)).toStrictEqual({
        start: '10:15',
        end: '11:15',
      })
    })

    test('neither pre and post', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, false, false)).toStrictEqual({
        start: '10:30',
        end: '11:00',
      })
    })
    test('pre only', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, true, false)).toStrictEqual({
        start: '10:15',
        end: '11:00',
      })
    })
    test('post only', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, false, true)).toStrictEqual({
        start: '10:30',
        end: '11:15',
      })
    })
  })

  describe('getPreDescription', () => {
    test('When present', () => {
      expect(getPreDescription(startTime, true)).toBe('10:15 to 10:30')
    })

    test('When absent', () => {
      expect(getPreDescription(startTime, false)).toBe(undefined)
    })
  })

  describe('getPostDescription', () => {
    test('When present', () => {
      expect(getPostDescription(endTime, true)).toBe('11:00 to 11:15')
    })

    test('When absent', () => {
      expect(getPostDescription(endTime, false)).toBe(undefined)
    })
  })
})

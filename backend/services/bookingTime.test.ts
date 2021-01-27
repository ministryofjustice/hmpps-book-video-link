import moment from 'moment'
import {
  createInterval,
  getPreAppointmentInterval,
  getPostAppointmentInterval,
  getTotalAppointmentInterval,
} from './bookingTimes'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'

describe('bookingTimes', () => {
  const startTime = moment('2020-11-20T10:30:00', DATE_TIME_FORMAT_SPEC, true)
  const endTime = moment('2020-11-20T11:00:00', DATE_TIME_FORMAT_SPEC, true)

  test('createInterval', () => {
    expect(createInterval([startTime, endTime])).toStrictEqual({ start: '10:30', end: '11:00' })
  })

  test('getPreAppointmentInterval', () => {
    expect(getPreAppointmentInterval(startTime)).toStrictEqual({ start: '10:10', end: '10:30' })
  })

  test('getPostAppointmentInterval', () => {
    expect(getPostAppointmentInterval(endTime)).toStrictEqual({ start: '11:00', end: '11:20' })
  })

  describe('getTotalAppointmentInterval', () => {
    test('both pre and post', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, true, true)).toStrictEqual({
        start: '10:10',
        end: '11:20',
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
        start: '10:10',
        end: '11:00',
      })
    })
    test('post only', () => {
      expect(getTotalAppointmentInterval(startTime, endTime, false, true)).toStrictEqual({
        start: '10:30',
        end: '11:20',
      })
    })
  })
})

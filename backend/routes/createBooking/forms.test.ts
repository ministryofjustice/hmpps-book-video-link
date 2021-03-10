import moment from 'moment'
import { buildDate, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { ChangeDateAndTime, RoomAndComment } from './forms'

describe('ChangeDateAndTime', () => {
  test('check parse', () => {
    const result = ChangeDateAndTime({
      bookingId: '123456',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      preAppointmentRequired: 'yes',
      postAppointmentRequired: 'no',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      preRequired: true,
      postRequired: false,
    })
  })

  test('fails on missing field', () => {
    expect(() =>
      ChangeDateAndTime({
        bookingId: '123456',
        date: '22/01/2020',
        startTimeHours: '10',
        startTimeMinutes: '30',
        endTimeHours: '11',
        endTimeMinutes: '00',
        postAppointmentRequired: 'no',
      })
    ).toThrowError('Missing or invalid keys: preAppointmentRequired')
  })

  test('fails on incorrect data type', () => {
    expect(() =>
      ChangeDateAndTime({
        bookingId: '123456',
        date: '22/01/2020',
        startTimeHours: ['10'],
        startTimeMinutes: '30',
        endTimeHours: 11,
        endTimeMinutes: '00',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      })
    ).toThrowError('Missing or invalid keys: startTimeHours,endTimeHours')
  })
})

describe('RoomAndComment', () => {
  test('check parse', () => {
    const result = RoomAndComment({
      preLocation: '20',
      mainLocation: '10',
      postLocation: '30',
      comment: 'A comment',
    })

    expect(result).toStrictEqual({
      preLocation: 20,
      mainLocation: 10,
      postLocation: 30,
      comment: 'A comment',
    })
  })

  test('check optional fields', () => {
    const result = RoomAndComment({
      mainLocation: '10',
      postLocation: '30',
    })

    expect(result).toStrictEqual({
      preLocation: null,
      mainLocation: 10,
      postLocation: 30,
      comment: null,
    })
  })

  test('check valid types', () => {
    expect(() =>
      RoomAndComment({
        mainLocation: ['10'],
        postLocation: '30',
        comment: [],
      })
    ).toThrowError('Non string keys: mainLocation,comment')
  })
})

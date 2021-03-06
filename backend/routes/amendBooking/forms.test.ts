import moment from 'moment'
import { buildDate, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { ChangeVideoLinkBooking, RoomAndComment } from './forms'

describe('ChangeVideoLinkBooking', () => {
  test('check parse required fields', () => {
    const result = ChangeVideoLinkBooking({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      mainLocation: '10',
      preRequired: 'false',
      postRequired: 'false',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      mainLocation: 10,
      preLocation: null,
      postLocation: null,
      preRequired: false,
      postRequired: false,
    })
  })

  test('check parse optional fields present', () => {
    const result = ChangeVideoLinkBooking({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      mainLocation: '10',
      preLocation: '20',
      postLocation: '30',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      courtId: 'CLDN',
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      mainLocation: 10,
      preLocation: 20,
      postLocation: 30,
      preRequired: true,
      postRequired: true,
    })
  })

  test('fails on missing field', () => {
    expect(() =>
      ChangeVideoLinkBooking({
        agencyId: 'WWI',
        courtId: 'CLDN',
        date: '22/01/2020',
        startTimeHours: '10',
        startTimeMinutes: '30',
        endTimeHours: '11',
        endTimeMinutes: '00',
        mainLocation: '10',
        postRequired: 'false',
      })
    ).toThrowError('Missing or invalid keys: preRequired')
  })

  test('fails on incorrect data type', () => {
    expect(() =>
      ChangeVideoLinkBooking({
        agencyId: 'WWI',
        courtId: 'CLDN',
        date: '22/01/2020',
        startTimeHours: ['10'],
        startTimeMinutes: '30',
        endTimeHours: 11,
        endTimeMinutes: '00',
        mainLocation: '10',
        preRequired: 'false',
        postRequired: 'false',
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
      comment: undefined,
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

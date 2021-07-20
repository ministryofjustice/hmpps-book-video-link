import moment from 'moment'
import { buildDate, DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import { ChangeVideoLinkBooking, SelectAlternative, toFormValues } from './forms'

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

describe('toFormValues', () => {
  test('all values', () => {
    expect(
      toFormValues(
        ChangeVideoLinkBooking({
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
      )
    ).toStrictEqual({
      courtId: 'CLDN',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      mainLocation: 10,
      preLocation: 20,
      postLocation: 30,
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

describe('SelectAlternative', () => {
  test('check parse required fields', () => {
    const result = SelectAlternative({
      startTime: '2021-01-11T12:00:00',
      endTime: '2021-01-11T12:30:00',
    })

    expect(result).toStrictEqual({
      startTime: moment('2021-01-11T12:00:00', DATE_TIME_FORMAT_SPEC),
      endTime: moment('2021-01-11T12:30:00', DATE_TIME_FORMAT_SPEC),
    })
  })

  test('fails on missing field', () => {
    expect(() =>
      SelectAlternative({
        startTime: '2021-01-11T12:00:00',
      })
    ).toThrowError('Missing or invalid keys: endTime')
  })

  test('fails on incorrect data type', () => {
    expect(() =>
      SelectAlternative({
        startTime: true,
        endTime: '2021-01-11T12:30:00',
      })
    ).toThrowError('Missing or invalid keys: startTime')
  })
})

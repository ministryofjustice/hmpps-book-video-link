import moment from 'moment'
import { buildDate, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../../shared/dateHelpers'
import { NewBooking, SelectAlternative } from './form'

describe('NewBooking', () => {
  test('check parse required fields', () => {
    const result = NewBooking({
      bookingId: '123456',
      courtId: 'COURT-1',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      mainLocation: '13',
      preRequired: 'false',
      postRequired: 'false',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      courtId: 'COURT-1',
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      preRequired: false,
      postRequired: false,
      mainLocation: 13,
      postLocation: null,
      preLocation: null,
    })
  })

  test('check parse optional fields present', () => {
    const result = NewBooking({
      bookingId: '123456',
      courtId: 'COURT-1',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      mainLocation: '13',
      preLocation: '14',
      postLocation: '15',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      bookingId: 123456,
      courtId: 'COURT-1',
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      preRequired: true,
      postRequired: true,
      mainLocation: 13,
      preLocation: 14,
      postLocation: 15,
    })
  })

  test('fails on missing field', () => {
    expect(() =>
      NewBooking({
        bookingId: '123456',
        courtId: 'COURT-1',
        date: '22/01/2020',
        startTimeHours: '10',
        startTimeMinutes: '30',
        endTimeHours: '11',
        endTimeMinutes: '00',
        mainLocation: '23',
        postRequired: 'false',
      })
    ).toThrowError('Missing or invalid keys: preRequired')
  })

  test('fails on incorrect data type', () => {
    expect(() =>
      NewBooking({
        bookingId: '123456',
        courtId: 'COURT-1',
        date: '22/01/2020',
        startTimeHours: ['10'],
        startTimeMinutes: '30',
        endTimeHours: 11,
        endTimeMinutes: '00',
        mainLocation: '12',
        preRequired: 'false',
        postRequired: 'false',
      })
    ).toThrowError('Missing or invalid keys: startTimeHours,endTimeHours')
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

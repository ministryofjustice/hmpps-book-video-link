import moment from 'moment'
import { buildDate, DAY_MONTH_YEAR } from '../../../shared/dateHelpers'
import { NewBooking } from './form'

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
      preRequired: 'no',
      postRequired: 'no',
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
        postRequired: 'no',
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
        preRequired: 'no',
        postRequired: 'no',
      })
    ).toThrowError('Missing or invalid keys: startTimeHours,endTimeHours')
  })
})

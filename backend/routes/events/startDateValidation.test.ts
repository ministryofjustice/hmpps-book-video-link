import moment from 'moment'
import startValidation from './startDateValidation'

describe('start date validation', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  it('should error when missing the day', () => {
    expect(startValidation(undefined, '3', '1987').startErrors).toEqual([
      { href: '#startDay', text: 'Start date must include a day' },
    ])
  })

  it('should error when missing the month', async () => {
    expect(startValidation('13', undefined, '1987').startErrors).toEqual([
      { text: 'Start date must include a month', href: '#startMonth' },
    ])
  })

  it('should error when missing the year', async () => {
    expect(startValidation('13', '3', undefined).startErrors).toEqual([
      { text: 'Start date must include a year', href: '#startYear' },
    ])
  })

  it('should error not a valid date', async () => {
    expect(startValidation('32', '3', '1987').startErrors).toEqual([
      { text: 'Enter a start date which is a real date', href: '#startDay' },
      { href: '#startError' },
    ])
  })

  it('should error when the date is in the future', async () => {
    const time = moment('2021-03-29').toDate().getTime()
    jest.spyOn(Date, 'now').mockImplementation(() => time)

    expect(startValidation('30', '3', '2021').startErrors).toEqual([
      { text: 'Enter a start date which is in the past', href: '#startDay' },
      { href: '#startError' },
    ])
  })

  it('should error when the date too far in the past', async () => {
    expect(startValidation('31', '12', '2020').startErrors).toEqual([
      { text: 'Start date must be after 2020', href: '#startDay' },
      { href: '#startError' },
    ])
  })
})

import eventsValidation from './eventsValidation'

describe('Events form validation', () => {
  it('Valid form', () => {
    const form = {
      startDay: '28',
      startMonth: '3',
      startYear: '2021',
      days: '6',
    }
    expect(eventsValidation(form)).toEqual([])
  })

  it('bad startDay', () => {
    const form = {
      startMonth: '3',
      startYear: '2021',
      days: '6',
    }
    expect(eventsValidation(form)).toHaveLength(1)
  })

  it('missing days', () => {
    const form = {
      startDay: '1',
      startMonth: '3',
      startYear: '2021',
    }
    expect(eventsValidation(form)).toEqual([
      {
        href: '#days',
        text: 'Enter the number of days of events to download',
      },
    ])
  })

  it('days invalid', () => {
    const form = {
      startDay: '1',
      startMonth: '3',
      startYear: '2021',
      days: 'x',
    }
    expect(eventsValidation(form)).toEqual([
      {
        href: '#days',
        text: 'Enter a number',
      },
    ])
  })

  it('days not positive', () => {
    const form = {
      startDay: '1',
      startMonth: '3',
      startYear: '2021',
      days: '0',
    }
    expect(eventsValidation(form)).toEqual([
      {
        href: '#days',
        text: 'Enter a number greater than 0',
      },
    ])
  })
})

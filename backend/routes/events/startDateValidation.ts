import moment from 'moment'

export default function (startDay, startMonth, startYear) {
  const startDate = moment({
    day: startDay,
    month: Number.isNaN(startMonth) ? startMonth : startMonth - 1,
    year: startYear,
  })
  const startIsValid =
    startDate.isValid() && !Number.isNaN(startDay) && !Number.isNaN(startMonth) && !Number.isNaN(startYear)
  const startErrors = []

  if (startDay && startMonth && startYear) {
    const startInThePast = startIsValid ? startDate.isSameOrBefore(moment(), 'day') : false
    const startIsTooEarly = startIsValid ? startDate.isBefore(moment({ day: 1, month: 0, year: 2021 })) : true

    if (!startIsValid) {
      startErrors.push({ text: 'Enter a start date which is a real date', href: '#startDay' }, { href: '#startError' })
    }

    if (startIsValid && !startInThePast) {
      startErrors.push({ text: 'Enter a start date which is in the past', href: '#startDay' }, { href: '#startError' })
    }

    if (startIsValid && startIsTooEarly) {
      startErrors.push({ text: 'Start date must be after 2020', href: '#startDay' }, { href: '#startError' })
    }
  }

  if (!startDay && (startMonth || startYear)) {
    startErrors.push({ text: 'Start date must include a day', href: '#startDay' })
  }

  if (!startMonth && (startDay || startYear)) {
    startErrors.push({ text: 'Start date must include a month', href: '#startMonth' })
  }

  if (!startYear && (startDay || startMonth)) {
    startErrors.push({ text: 'Start date must include a year', href: '#startYear' })
  }

  return { startDate, startErrors }
}

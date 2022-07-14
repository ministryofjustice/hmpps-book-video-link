import startDateValidation from './startDateValidation'

export default formValues => {
  const { startDay, startMonth, startYear, days } = formValues
  const { startErrors: errors } = startDateValidation(startDay, startMonth, startYear)

  if (!days) {
    errors.push({ text: 'Enter the number of days of events to download', href: '#days' })
  } else {
    const daysNumber = Number(days)
    if (Number.isNaN(daysNumber)) {
      errors.push({ text: 'Enter a number', href: '#days' })
    } else if (daysNumber < 1) {
      errors.push({ text: 'Enter a number greater than 0', href: '#days' })
    }
  }

  return errors
}

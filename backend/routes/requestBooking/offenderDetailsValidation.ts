import moment from 'moment'

import type { ValidationError } from '../../middleware/validationMiddleware'
import { assertHasOptionalStringValues } from '../../utils'

export const errorTypes = {
  missingFirstName: {
    text: 'Enter a first name',
    href: '#first-name',
  },
  missingLastName: {
    text: 'Enter a last name',
    href: '#last-name',
  },
  dateOfBirth: {
    missing: {
      text: 'Enter a date of birth',
      href: '#dobDay',
    },
    invalid: {
      text: 'Enter a date of birth which is a real date',
      href: '#dobDay',
    },
    past: {
      text: 'Enter a date of birth which is in the past',
      href: '#dobDay',
    },
    after1900: {
      text: 'Date of birth must be after 1900',
      href: '#dobDay',
    },
    missingDay: {
      text: 'Date of birth must include a day',
      href: '#dobDay',
    },
    missingMonth: {
      text: 'Date of birth must include a month',
      href: '#dobMonth',
    },
    missingYear: {
      text: 'Date of birth must include a year',
      href: '#dobYear',
    },
  },
  commentLength: {
    text: 'Maximum length should not exceed 3600 characters',
    href: '#comments',
  },
}

export const dobError = {
  href: '#dobError',
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  assertHasOptionalStringValues(form, ['firstName', 'lastName', 'dobDay', 'dobMonth', 'dobYear', 'comments'])
  const { firstName, lastName, dobDay: dayString, dobMonth: monthString, dobYear: yearString, comments } = form

  const errors: ValidationError[] = []

  if (!firstName) errors.push(errorTypes.missingFirstName)
  if (!lastName) errors.push(errorTypes.missingLastName)
  if (!yearString && !dayString && !monthString) errors.push(errorTypes.dateOfBirth.missing, dobError)

  if (dayString && monthString && yearString) {
    const day = Number(dayString)
    const month = Number(monthString)
    const year = Number(yearString)

    const dateOfBirth = moment({
      day,
      month: Number.isNaN(month) ? month : month - 1,
      year,
    })

    const dobIsValid = dateOfBirth.isValid() && !Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)

    const dobInThePast = dobIsValid ? dateOfBirth.isBefore(moment(), 'day') : false
    const dobIsTooEarly = dobIsValid ? dateOfBirth.isBefore(moment({ day: 1, month: 0, year: 1900 })) : true

    if (!dobIsValid) errors.push(errorTypes.dateOfBirth.invalid, dobError)

    if (dobIsValid && !dobInThePast) errors.push(errorTypes.dateOfBirth.past, dobError)

    if (dobIsValid && dobIsTooEarly) errors.push(errorTypes.dateOfBirth.after1900, dobError)
  }

  if (!dayString && (monthString || yearString)) errors.push(errorTypes.dateOfBirth.missingDay, dobError)

  if (!monthString && (dayString || yearString)) errors.push(errorTypes.dateOfBirth.missingMonth, dobError)

  if (!yearString && (dayString || monthString)) errors.push(errorTypes.dateOfBirth.missingYear, dobError)

  if (comments && comments.length > 3600) errors.push(errorTypes.commentLength)

  return errors
}

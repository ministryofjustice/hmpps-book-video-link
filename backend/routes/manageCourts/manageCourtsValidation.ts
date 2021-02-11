import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  atLeastOne: {
    text: 'You need to select at least one court',
    href: '#court',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  const { courts } = form

  const errors: ValidationError[] = []

  if (!courts) errors.push(errorTypes.atLeastOne)

  return errors
}

import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingHearingLocation: {
    text: 'Select which court you are in',
    href: '#court-id',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  const { courtId } = form

  const errors: ValidationError[] = []

  if (!courtId) errors.push(errorTypes.missingHearingLocation)

  return errors
}

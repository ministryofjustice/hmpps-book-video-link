import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingHearingLocation: {
    text: 'Select which court you are in',
    href: '#hearing-location',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  const { hearingLocation } = form

  const errors: ValidationError[] = []

  if (!hearingLocation) errors.push(errorTypes.missingHearingLocation)

  return errors
}

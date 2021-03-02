import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingCourt: {
    text: 'Select which court you are in',
    href: '#court',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  return !form.court ? [errorTypes.missingCourt] : []
}

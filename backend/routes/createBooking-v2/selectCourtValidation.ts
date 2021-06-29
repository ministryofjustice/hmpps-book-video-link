import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingCourt: {
    text: 'Select which court you are in',
    href: '#courtId',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  return !form.courtId ? [errorTypes.missingCourt] : []
}

import type { ValidationError } from '../../../middleware/validationMiddleware'
import { assertHasOptionalStringValues } from '../../../utils'

export const errorTypes = {
  commentLength: {
    text: 'Maximum length should not exceed 3600 characters',
    href: '#comment',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  assertHasOptionalStringValues(form, ['comment'])
  const { comment } = form
  return comment && comment.length > 3600 ? [errorTypes.commentLength] : []
}

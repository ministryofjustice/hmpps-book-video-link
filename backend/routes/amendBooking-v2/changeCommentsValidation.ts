import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  commentLength: {
    text: 'Maximum length should not exceed 3600 characters',
    href: '#comment',
  },
}

export default function validate(form: Record<string, string>): ValidationError[] {
  const { comment } = form

  const errors: ValidationError[] = []

  if (comment && comment.length > 3600) errors.push(errorTypes.commentLength)

  return errors
}

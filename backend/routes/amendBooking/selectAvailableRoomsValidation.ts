import type { ValidationError } from '../../middleware/validationMiddleware'
import { assertHasOptionalStringValues } from '../../utils'

export const errorTypes = {
  missingMainLocation: {
    text: 'Select a prison room for the court hearing video link',
    href: '#mainLocation',
  },
  preLocation: {
    missing: {
      text: 'Select a prison room for the pre-court hearing briefing',
      href: '#preLocation',
    },
  },
  postLocation: {
    missing: {
      text: 'Select a prison room for the post-court hearing briefing',
      href: '#postLocation',
    },
  },
  commentLength: {
    text: 'Maximum length should not exceed 3600 characters',
    href: '#comment',
  },
}

export default function validate(form: Record<string, unknown>): ValidationError[] {
  assertHasOptionalStringValues(form, [
    'preRequired',
    'postRequired',
    'preLocation',
    'postLocation',
    'mainLocation',
    'comment',
  ])

  const { preRequired, postRequired, preLocation, postLocation, mainLocation, comment } = form

  const errors: ValidationError[] = []

  if (preRequired === 'true' && !preLocation) errors.push(errorTypes.preLocation.missing)
  if (!mainLocation) errors.push(errorTypes.missingMainLocation)
  if (postRequired === 'true' && !postLocation) errors.push(errorTypes.postLocation.missing)
  if (comment && comment.length > 3600) errors.push(errorTypes.commentLength)

  return errors
}
